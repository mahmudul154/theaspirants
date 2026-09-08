package com.aspirants.app;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Opens an external URL in Chrome specifically. This prevents Android App Links
 * from handing a Gemini URL back to the Gemini app instead of Chrome.
 */
@CapacitorPlugin(name = "ChromeBrowser")
public class ChromeBrowserPlugin extends Plugin {
    private static final String CHROME_PACKAGE = "com.android.chrome";

    @PluginMethod
    public void open(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.trim().isEmpty()) {
            call.reject("A URL is required");
            return;
        }

        Intent chromeIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        chromeIntent.setPackage(CHROME_PACKAGE);

        try {
            getActivity().startActivity(chromeIntent);
            JSObject result = new JSObject();
            result.put("browser", "chrome");
            call.resolve(result);
        } catch (ActivityNotFoundException error) {
            // Do not open the Gemini app as a fallback: the action is intended
            // for Chrome. The web layer gives the user a clear install message.
            call.reject("Chrome is not installed", error);
        }
    }
}
