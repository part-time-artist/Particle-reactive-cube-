# How to Use the Point Cloud Cube in Framer

Since Framer is a web-based (or app-based) design tool, you cannot simply "open" the `.tsx` file with it. You must create a **Code Component** inside Framer and paste the code.

## Step-by-Step Instructions

1.  **Open Framer**: Go to [framer.com](https://framer.com) and open your project (or create a new one).
2.  **Copy the Code**: Open the `FramerPointCloudCube.tsx` file on your computer and copy **all** the text.
3.  **Create Component**:
    *   In the Framer interface, look for the **Assets** panel (usually on the left).
    *   Click the **Code** tab.
    *   Click the **+** (Plus) icon to create a new file.
    *   Name it `PointCloudCube`.
    *   Make sure "New Component" is selected (not Override).
    *   Click **Create**.
4.  **Paste Code**:
    *   A code editor window will open in Framer.
    *   **Delete everything** currently in that file.
    *   **Paste** the code you copied from `FramerPointCloudCube.tsx`.
5.  **Save & Close**:
    *   Press `Cmd+S` (Mac) or `Ctrl+S` (Windows) to save.
    *   Close the code editor overlay (click the X or click outside).
6.  **Use It**:
    *   Go back to the **Assets** panel -> **Code** section.
    *   Drag the `PointCloudCube` component onto your canvas (the web page design area).

## Troubleshooting Imports

If Framer gives you errors about "missing modules" (like `three` or `@react-three/fiber`), you may need to use URL imports instead of package names.

Replace the top import lines in Framer with these:

```javascript
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { Canvas, useFrame } from "https://esm.sh/@react-three/fiber"
import { OrbitControls } from "https://esm.sh/@react-three/drei"
import * as THREE from "https://esm.sh/three"
```

(Note: Framer's built-in package manager usually handles the standard imports automatically, so try the original code first!)
