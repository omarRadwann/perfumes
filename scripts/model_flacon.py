"""
Procedurally model a crafted NOCTÉ extrait flacon and export to GLB.

Approach: a *superellipse sweep*. Each horizontal cross-section is a superellipse
|x/a|^n + |y/b|^n = 1.  By varying (a, b, n) with height we morph a rounded-
rectangular body → tapered shoulder → round neck — the silhouette of a real
luxury extrait bottle (Initio / BDK / Maison Crivelli family), which a plain
RoundedBox can never read as.  One mesh, reused across all six scents; per-scent
glass/juice/cap colour is applied in R3F.  Output nodes: glass, juice, collar, cap.
"""
import numpy as np
import trimesh

P = 96  # points around each ring (smooth)


def smoothstep(t):
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3 - 2 * t)


def superellipse_ring(a, b, n, y):
    """One ring of P points on a superellipse at height y (Y-up)."""
    t = np.linspace(0, 2 * np.pi, P, endpoint=False)
    ct, st = np.cos(t), np.sin(t)
    e = 2.0 / n
    x = a * np.sign(ct) * (np.abs(ct) ** e)
    z = b * np.sign(st) * (np.abs(st) ** e)
    return np.stack([x, np.full_like(x, y), z], axis=1)


def sweep(keyframes, n_rings, close_bottom=True, close_top=True, top_center_y=None):
    """keyframes: list of (y, a, b, n). Returns a watertight Trimesh."""
    ys = np.array([k[0] for k in keyframes])
    A = np.array([k[1] for k in keyframes])
    B = np.array([k[2] for k in keyframes])
    N = np.array([k[3] for k in keyframes])
    y0, y1 = ys[0], ys[-1]
    rings = []
    for i in range(n_rings):
        yy = y0 + (y1 - y0) * i / (n_rings - 1)
        # find segment
        seg = np.searchsorted(ys, yy, side="right") - 1
        seg = int(np.clip(seg, 0, len(ys) - 2))
        span = ys[seg + 1] - ys[seg]
        local = 0.0 if span <= 1e-9 else (yy - ys[seg]) / span
        s = smoothstep(local)
        a = A[seg] + (A[seg + 1] - A[seg]) * s
        b = B[seg] + (B[seg + 1] - B[seg]) * s
        nn = N[seg] + (N[seg + 1] - N[seg]) * s
        rings.append(superellipse_ring(a, b, nn, yy))
    verts = np.concatenate(rings, axis=0)
    faces = []
    for r in range(n_rings - 1):
        base = r * P
        for i in range(P):
            j = (i + 1) % P
            a0 = base + i
            b0 = base + j
            c0 = base + P + j
            d0 = base + P + i
            faces.append([a0, b0, c0])
            faces.append([a0, c0, d0])
    verts = list(verts)
    if close_bottom:
        cb = len(verts)
        verts.append([0, ys[0], 0])
        for i in range(P):
            j = (i + 1) % P
            faces.append([cb, j, i])  # facing down
    if close_top:
        ct = len(verts)
        ty = top_center_y if top_center_y is not None else ys[-1]
        verts.append([0, ty, 0])
        top_base = (n_rings - 1) * P
        for i in range(P):
            j = (i + 1) % P
            faces.append([ct, top_base + i, top_base + j])  # facing up
    mesh = trimesh.Trimesh(vertices=np.array(verts), faces=np.array(faces), process=True)
    mesh.fix_normals()
    return mesh


# --- glass body: rounded-rect body → round shoulder → cylindrical neck ----------
glass = sweep(
    [
        # y,     a,     b,     n
        (0.000, 0.300, 0.190, 5.0),  # base (slightly inset foot)
        (0.045, 0.330, 0.205, 5.2),  # flare to full body
        (0.760, 0.330, 0.205, 5.2),  # straight body
        (0.880, 0.300, 0.180, 4.2),  # shoulder begins
        (0.965, 0.150, 0.120, 2.8),  # rounding inward
        (1.020, 0.085, 0.085, 2.0),  # neck base (round)
        (1.130, 0.078, 0.078, 2.0),  # neck top
    ],
    n_rings=120,
    close_top=True,
    top_center_y=1.130,
)
glass.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
    name="glass", baseColorFactor=[235, 240, 245, 90], metallicFactor=0.0, roughnessFactor=0.05))

# --- juice: inset copy filling the body --------------------------------------
juice = sweep(
    [
        (0.040, 0.285, 0.176, 5.2),
        (0.070, 0.300, 0.184, 5.2),
        (0.770, 0.300, 0.184, 5.2),
        (0.860, 0.250, 0.150, 4.5),
        (0.900, 0.180, 0.120, 3.6),
    ],
    n_rings=70,
    close_top=True,
    top_center_y=0.900,
)
juice.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
    name="juice", baseColorFactor=[180, 120, 60, 255], metallicFactor=0.0, roughnessFactor=0.25))

# --- collar: a turned metal ring at the neck ---------------------------------
collar = sweep(
    [
        (0.985, 0.108, 0.108, 2.0),
        (1.010, 0.118, 0.118, 2.0),  # widest
        (1.055, 0.100, 0.100, 2.0),
    ],
    n_rings=20,
    close_bottom=True,
    close_top=True,
)
collar.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
    name="collar", baseColorFactor=[210, 180, 120, 255], metallicFactor=1.0, roughnessFactor=0.18))

# --- cap: substantial faceted stopper echoing the body -----------------------
cap = sweep(
    [
        (1.050, 0.150, 0.120, 4.6),  # base meets collar
        (1.075, 0.170, 0.132, 4.6),  # full cap
        (1.300, 0.166, 0.128, 4.6),  # body of cap
        (1.345, 0.140, 0.108, 4.6),  # top chamfer in
        (1.370, 0.090, 0.070, 4.2),  # top
    ],
    n_rings=44,
    close_bottom=True,
    close_top=True,
    top_center_y=1.378,
)
cap.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
    name="cap", baseColorFactor=[214, 184, 124, 255], metallicFactor=1.0, roughnessFactor=0.16))

scene = trimesh.Scene()
scene.add_geometry(glass, geom_name="glass", node_name="glass")
scene.add_geometry(juice, geom_name="juice", node_name="juice")
scene.add_geometry(collar, geom_name="collar", node_name="collar")
scene.add_geometry(cap, geom_name="cap", node_name="cap")

out = "public/models/flacon.glb"
scene.export(out)
import os
size = os.path.getsize(out)
print(f"exported {out}  ({size/1024:.0f} KB)")
for nm, g in [("glass", glass), ("juice", juice), ("collar", collar), ("cap", cap)]:
    print(f"  {nm:6s} verts={len(g.vertices):5d} faces={len(g.faces):5d} watertight={g.is_watertight} bounds_y=[{g.bounds[0][1]:.3f},{g.bounds[1][1]:.3f}]")
print(f"overall bounds: {scene.bounds.tolist()}")
