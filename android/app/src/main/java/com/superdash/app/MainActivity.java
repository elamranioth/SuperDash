package com.superdash.app;

import android.app.DownloadManager;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.webkit.DownloadListener;
import android.webkit.URLUtil;
import android.webkit.WebView;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.setDownloadListener(new DownloadListener() {
                    @Override
                    public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
                        try {
                            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                            request.setMimeType("application/vnd.android.package-archive");
                            request.addRequestHeader("User-Agent", userAgent);
                            request.setDescription("Downloading SuperDash update...");
                            String filename = URLUtil.guessFileName(url, contentDisposition, mimeType);
                            if (!filename.endsWith(".apk")) {
                                filename = "SuperDash.apk";
                            }
                            request.setTitle(filename);
                            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename);

                            DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                            if (dm != null) {
                                dm.enqueue(request);
                                Toast.makeText(getApplicationContext(), "Downloading update...", Toast.LENGTH_SHORT).show();
                            }
                        } catch (Exception e) {
                            try {
                                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                                startActivity(intent);
                            } catch (Exception ex) {
                                Toast.makeText(getApplicationContext(), "Download failed: " + ex.getMessage(), Toast.LENGTH_LONG).show();
                            }
                        }
                    }
                });
            }
        } catch (Exception e) {
            // bridge might not be ready yet
        }
    }
}
