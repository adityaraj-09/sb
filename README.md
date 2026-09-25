# Android Attendance App

Local-only React Native attendance app for Admin and Staff. Login, staff management, selfie face enrolment, active liveness, face match, and attendance (timestamp + selfie + GPS) all stay on the phone. There are no API calls.

## Demo credentials

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `admin123` |
| Sample staff | `EMP001` | `staff123` |

New staff created by Admin get username = employee ID and password `staff123`.

The sample staff member has **no enrolled face** until Admin enrols one. Use the same phone for Admin and Staff — data does not sync across devices.

## How to run

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on an Android phone, or press `a` for a USB device / emulator.

Camera and location need a **real device**. The Android emulator camera is a poor liveness test.

### Android APK

A debug-signed **arm64-v8a** release APK was built here (`attendance_arm64_release.apk`, ~51 MB). It is signed with the Android debug keystore, which is fine for assignment review on a real phone. This is not Play Store signing.

Rebuild locally:

```bash
npx expo prebuild --platform android
# ANDROID_HOME must include platform android-36, build-tools 36.0.0, NDK 27.1.12297006
cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

Or with EAS (requires an Expo login):

```bash
npx eas-cli build --platform android --profile preview
```

`eas.json` is set to output an APK for the `preview` and `production` profiles.

## Technology / architecture

- **Expo SDK 57 + React Native + TypeScript**
- **Dark Cursor-like UI** — near-black chrome (`#0A0A0A`), white text, hairline borders, white primary buttons. Open fonts **Geist Sans** + **Geist Mono** stand in for Cursor Gothic / Berkeley Mono (those two are proprietary).
- **Expo Router** for Admin vs Staff stacks
- **AsyncStorage** for users, staff, face embeddings, attendance rows, and session
- **expo-file-system** for enrolled faces (`faces/{staffId}.jpg`) and attendance selfies (`attendance/{id}.jpg`)
- **expo-camera** front camera, live camera only (no gallery)
- **expo-location** required GPS on mark attendance
- **On-device liveness** — randomized blink / turn-left / turn-right challenge. Frames are sampled from the camera, a face is required in the oval, then the asked motion must happen before capture.
- **On-device face match** — cropped selfie → local embedding → cosine similarity (threshold `0.86`). Attendance is stored only if liveness passed **and** the face matches that staff member’s enrolled embedding.

```text
Login
  ├─ Admin: staff list → add staff → profile → enrol/re-enrol face
  └─ Staff: home → mark attendance (location + liveness + match) → history
```

## Assumptions and limitations

- No backend. Uninstalling the app wipes data.
- Admin and Staff must use the **same device**.
- Android-first. iOS may run but is not the assignment target.
- Liveness beats a still photo held still. It does not beat a high-quality video replay of someone blinking or turning.
- Face match is a local similarity check, not bank-grade biometrics. Use decent light and a frontal face.
- Camera and location permissions are required for attendance. Location cannot be skipped.
- Dummy passwords are stored in AsyncStorage as plain text.
- No edit/delete staff. Re-enrol overwrites the previous face.
- APK is built with EAS / a local Android toolchain, not in this cloud workspace.

## AI conversation

The assignment asks for a JSON export of the AI chat used while building. Export this Cursor / Cloud Agent thread from the product UI and attach that file to the submission. Do not invent a transcript.

## Tests

```bash
npm test
npx tsc --noEmit
```
