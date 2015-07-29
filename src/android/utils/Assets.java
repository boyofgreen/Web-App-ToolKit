package com.manifoldjs.webapptoolkit.utils;

import android.content.Context;
import android.util.Base64;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public class Assets {
  public static String readEncoded(String fileName, Context context) {
    InputStream ins = null;

    // Remove starting "/" character if present (asset paths should be relative)
    if (fileName.startsWith("/")) {
      fileName = fileName.substring(1);
    }

    try {
      ins = context.getAssets().open(fileName);

      int size = ins.available();
      byte[] buffer = new byte[size];
      ins.read(buffer);
      ins.close();
      ins = null;

      int offset = 0;
      byte[] BOM = new byte[] { (byte)239, (byte)187, (byte)191 };
      if (buffer.length >= 3 && buffer[0] == BOM[0] && buffer[1] == BOM[1] && buffer[2] == BOM[2]) {
        offset = 3;
      }

      return Base64.encodeToString(buffer, offset, size - offset, Base64.NO_WRAP);
    } catch (IOException ioe) {
      return null;
    } finally {
      if (ins != null) {
        try {
          ins.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }

    }
  }

  public static String readText(String fileName, Context context) {
    InputStream ins = null;
    try {
      ins = context.getAssets().open(fileName);
      InputStreamReader reader = new InputStreamReader(ins);

      int size = ins.available();
      byte[] buffer = new byte[size];
      ins.read(buffer);
      ins.close();
      ins = null;

      return new String(buffer, reader.getEncoding());
    }
    catch(IOException ioe) {
      return null;
    }
    finally {
      if(ins != null) {
        try {
          ins.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
    }
  }
}
