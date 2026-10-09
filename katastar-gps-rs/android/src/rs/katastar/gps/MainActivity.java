package rs.katastar.gps;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Handler;
import android.os.Bundle;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

/**
 * Ugradjeni browser za ekatastar.rgurs.org. Na svaku stranicu sajta ubacuje
 * assets/katastar-gps-rs.user.js koji na njihovu mapu crta GPS poziciju.
 * Captchu i pretragu rjesava korisnik; aplikacija ne dira zastitu sajta.
 */
public class MainActivity extends Activity {
    private static final String HOME = "https://ekatastar.rgurs.org/";
    private static final int REQ_LOCATION = 1;

    private final Handler ui = new Handler();
    private WebView web;
    private String script = "";
    private String pendingOrigin;
    private GeolocationPermissions.Callback pendingCallback;

    private final Runnable show = new Runnable() {
        @Override
        public void run() {
            if (web != null) web.setAlpha(1f);
        }
    };

    private boolean hasLocation() {
        return checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    /** Dozvoljeni hostovi unutar aplikacije: sajt i Google reCAPTCHA. */
    private static boolean isAllowedHost(String host) {
        if (host == null) return false;
        return host.endsWith("rgurs.org") || host.endsWith("google.com")
                || host.endsWith("gstatic.com") || host.endsWith("recaptcha.net");
    }

    private String readAsset(String name) {
        try {
            InputStream in = getAssets().open(name);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            in.close();
            return out.toString("UTF-8");
        } catch (Exception e) {
            return "";
        }
    }

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        script = readAsset("katastar-gps-rs.user.js");

        getWindow().setStatusBarColor(Color.parseColor("#101114"));
        getWindow().setNavigationBarColor(Color.parseColor("#101114"));
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#101114"));
        web.setLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setGeolocationEnabled(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        // Raspored uvijek na sirinu uredjaja (bez horizontalnog skrola, ignorise viewport sajta)
        s.setUseWideViewPort(false);
        s.setLoadWithOverviewMode(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);
        cm.setAcceptThirdPartyCookies(web, true);

        web.setWebViewClient(new WebViewClient() {
            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                Uri u = Uri.parse(url);
                if ("https".equals(u.getScheme()) && isAllowedHost(u.getHost())) return false;
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, u));
                } catch (Exception ignored) {
                }
                return true;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                // sakrij stranicu dok se ne primijeni tema (bez bijelog bljeska); sigurnosni povratak nakon 3 s
                view.setAlpha(0f);
                ui.postDelayed(show, 3000);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                CookieManager.getInstance().flush();
                inject(view, url);
                ui.postDelayed(show, 250);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    view.loadDataWithBaseURL(null,
                            "<meta name='viewport' content='width=device-width,initial-scale=1'>"
                                    + "<body style='font-family:sans-serif;padding:24px'>"
                                    + "<h2>Nema veze</h2><p>Nije moguce otvoriti ekatastar. Provjerite internet.</p>"
                                    + "<p><a href='" + HOME + "'>Pokusaj ponovo</a></p></body>",
                            "text/html", "UTF-8", null);
                }
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                if (hasLocation()) {
                    callback.invoke(origin, true, false);
                } else {
                    pendingOrigin = origin;
                    pendingCallback = callback;
                    requestPermissions(new String[]{
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION}, REQ_LOCATION);
                }
            }
        });

        if (!hasLocation()) {
            requestPermissions(new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION}, REQ_LOCATION);
        }

        if (state != null) {
            web.restoreState(state);
        } else {
            web.loadUrl(HOME);
        }
    }

    /** Ubacuje GPS skript samo na stranice sajta (skript se sam cuva od dvostrukog pokretanja). */
    private void inject(WebView view, String url) {
        if (script.isEmpty() || url == null) return;
        Uri u = Uri.parse(url);
        if (u.getHost() != null && u.getHost().endsWith("rgurs.org")) {
            view.evaluateJavascript(script, null);
        }
    }

    @Override
    protected void onPause() {
        CookieManager.getInstance().flush();
        super.onPause();
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] results) {
        if (code != REQ_LOCATION) return;
        boolean ok = hasLocation();
        if (pendingCallback != null) {
            pendingCallback.invoke(pendingOrigin, ok, false);
            pendingCallback = null;
            pendingOrigin = null;
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        // ako je mapa otvorena, "nazad" je zatvara; inace ide nazad po stranicama
        web.evaluateJavascript("(function(){var r=document.getElementById('kgrs');"
                + "if(r&&r.classList.contains('on')){r.querySelector('.top .rb').click();return 1}return 0})()",
                new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String v) {
                        if ("1".equals(v)) return;
                        if (web.canGoBack()) web.goBack();
                        else finish();
                    }
                });
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
