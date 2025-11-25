

const STORE_SECRET_KEY = '123@VAN&%UYTREDCBHo%9SFSFSFBHBHT656QR45QFJHB7%@ReToucH%@DesIgn';
const LICENSE_STORAGE_KEY = 'app_license_key';
const SERIAL_STORAGE_KEY = 'app_machine_serial';

// --- Helper Functions from your provided code ---

function ctime(s: string): string {
  let a = 1, c = 0, h, o;
  if (s) {
      a = 0;
      for (h = s.length - 1; h >= 0; h--) {
          o = s.charCodeAt(h);
          a = (a << 6 & 268435123) + o + (o << 14);
          c = a & 266338304;
          a = c !== 0 ? a ^ c >> 21 : a;
      }
  }
  return String(a);
}

function strToHex(str: string): string {
  let padding = "";
  for (let index = 0; index < str.length; index++) {
      let charCode = "" + str.charCodeAt(index).toString(16);
      padding += charCode.length < 2 ? "0" + charCode : charCode;
  }
  return padding;
}

function hexToStr(hex: string): string {
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

function salt(data: string, saltCode: string): string {
  let resultStr = "";
  for (let index = 0; index < data.length; index++) {
      let code = data.charCodeAt(index % data.length) ^ saltCode.charCodeAt(index % saltCode.length);
      resultStr += String.fromCharCode(code);
  }
  // Note: The original function returned strToHex here. 
  // But for decryption (unsalt), we need the raw string result before hex conversion implies the input was hex.
  // To keep it compatible with your generation logic:
  // Encryption: Input(Raw) -> Salt -> Hex
  // Decryption: Input(Hex) -> UnHex -> Salt -> Raw
  return resultStr;
}

// --- Core Service ---

export const getMachineId = (): string => {
  let serial = localStorage.getItem(SERIAL_STORAGE_KEY);
  if (!serial) {
    // Generate a pseudo-random serial mostly compatible with your format (no dashes)
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const timestampPart = Date.now().toString(36).toUpperCase();
    serial = `VQ${randomPart}${timestampPart}`; 
    localStorage.setItem(SERIAL_STORAGE_KEY, serial);
  }
  return serial;
};

export const saveLicenseKey = (key: string) => {
  localStorage.setItem(LICENSE_STORAGE_KEY, key);
};

export const getSavedLicenseKey = () => {
  return localStorage.getItem(LICENSE_STORAGE_KEY);
};

export interface LicenseStatus {
  isValid: boolean;
  message?: string;
  expiryDate?: Date;
}

export const validateLicense = (key: string): LicenseStatus => {
  try {
    if (!key) return { isValid: false, message: "Chưa nhập khóa kích hoạt." };

    // 1. Convert Hex to String (Reverse of strToHex)
    const rawString = hexToStr(key);

    // 2. Unsalt (XOR is symmetric, so we run salt again)
    const decrypted = salt(rawString, STORE_SECRET_KEY);

    // 3. Split data: "HashSerial|ExpiryTimestamp"
    const parts = decrypted.split('|');
    if (parts.length !== 2) {
      return { isValid: false, message: "Khóa không đúng định dạng." };
    }

    const [hashSerial, expiryTimestampStr] = parts;
    
    // 4. Validate Serial
    const currentSerial = getMachineId();
    const expectedHash = ctime(currentSerial);

    if (hashSerial !== expectedHash) {
      return { isValid: false, message: "Khóa này không dành cho máy này." };
    }

    // 5. Validate Expiry
    const expiryTimestamp = parseFloat(expiryTimestampStr);
    const now = Date.now() / 1000; // Your algorithm uses seconds

    if (now > expiryTimestamp) {
      return { isValid: false, message: "Khóa kích hoạt đã hết hạn." };
    }

    return { 
      isValid: true, 
      expiryDate: new Date(expiryTimestamp * 1000) 
    };

  } catch (e) {
    console.error(e);
    return { isValid: false, message: "Khóa không hợp lệ." };
  }
};

// --- Admin Generator (Optional, for you to use in console if needed) ---
export const generateLicenseForMachine = (serial: string, daysValid: number) => {
  const expiryTime = daysValid * 24 * 60 * 60 * 1000;
  const expiryDate = new Date(Date.now() + expiryTime);
  const payload = ctime(serial) + "|" + (expiryDate.getTime() / 1000).toString();
  
  // Logic: Salt then Hex
  // Modified salt function above returns Raw string, so we wrap it
  let resultStr = "";
  for (let index = 0; index < payload.length; index++) {
      let code = payload.charCodeAt(index % payload.length) ^ STORE_SECRET_KEY.charCodeAt(index % STORE_SECRET_KEY.length);
      resultStr += String.fromCharCode(code);
  }
  return strToHex(resultStr);
};