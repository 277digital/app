#!/usr/bin/env bash
# Gradi APK bez Gradle-a (aapt + javac + dx + apksigner). Potrebno:
#   apt-get install aapt apksigner zipalign dalvik-exchange android-sdk-platform-23 openjdk-17-jdk-headless
set -euo pipefail
cd "$(dirname "$0")"
ANDROID_JAR=${ANDROID_JAR:-/usr/lib/android-sdk/platforms/android-23/android.jar}
JAVAC=${JAVAC:-javac}
OUT=build
KS=debug.keystore   # standardni debug kljuc (nije tajna); isti kljuc omogucava azuriranje preko stare verzije

rm -rf $OUT && mkdir -p $OUT/gen $OUT/classes assets
cp ../userscript/katastar-gps-rs.user.js assets/

[ -f $KS ] || keytool -genkeypair -keystore $KS -storepass android -keypass android -alias androiddebugkey \
  -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US" >/dev/null 2>&1

aapt package -f -M AndroidManifest.xml -S res -A assets -I "$ANDROID_JAR" \
  --min-sdk-version 21 --target-sdk-version 34 -J $OUT/gen -F $OUT/unsigned.apk
$JAVAC --release 8 -Xlint:-options -cp "$ANDROID_JAR" -d $OUT/classes \
  $(find $OUT/gen src -name '*.java')
dalvik-exchange --dex --min-sdk-version=21 --output=$OUT/classes.dex $OUT/classes
(cd $OUT && aapt add unsigned.apk classes.dex >/dev/null)
zipalign -f 4 $OUT/unsigned.apk $OUT/aligned.apk
apksigner sign --ks $KS --ks-pass pass:android --key-pass pass:android --out katastar-gps-rs.apk $OUT/aligned.apk
apksigner verify --print-certs katastar-gps-rs.apk | head -2
ls -l katastar-gps-rs.apk
