# Texturas y audio intercambiables

El juego carga sus texturas como imágenes PNG. Puedes reemplazar cualquier archivo
por el de tu texture pack favorito manteniendo el mismo nombre de archivo.

## Carpetas

- `public/textures/blocks/*.png` — texturas de bloques (recomendado 16×16).
  - `grass_top.png`, `grass_side.png`, `dirt.png`, `stone.png`, `planks.png`,
    `log_side.png`, `log_top.png`, `leaves.png`, `chest.png`, `sand.png`,
    `gravel.png`, `birch_side.png`, `birch_top.png`, `birch_leaves.png`,
    `tnt.png`, `flower_red.png`, `flower_yellow.png`, `tall_grass.png`,
    `cake_top.png`, `cake_side.png`
- `public/textures/mobs/*.png` — criaturas (sprites frontales, fondo transparente).
  - `zombie.png`, `skeleton.png`, `cow.png`, `pig.png`, `sheep.png`,
    `chicken.png`, `villager.png`, `creeper.png`, `slime.png`
- `public/textures/skin.png` — skin del jugador (64×64, formato Minecraft clásico).
- `public/audio/theme.mp3` — (opcional) tu propia música. Para usarla, coloca el
  archivo y ajusta `CUSTOM_TRACK` en `lib/audio.ts` a `"/audio/theme.mp3"`.
  Si lo dejas en `null`, suena la música ambiental generada por el juego.

## Regenerar las texturas por defecto

```
node scripts/generate-textures.mjs
```

> Nota: el script regenera las texturas "generadas" (birch, cofre, TNT, tarta, skin,
> mobs) pero también sobrescribe las del pack CC0 que se usan para el terreno. Si
> ejecutas el script, vuelve a copiar el pack o mantén una copia de los PNG.

## Créditos

- Texturas de bloques y plantas: **"16x16 Block Texture Set"** de *ARoachIFoundOnMyPillow*
  (OpenGameArt), licencia **CC0**.
  https://opengameart.org/content/16x16-block-texture-set
- Música: **"First Light Particles"** de *Yoiyami* (OpenGameArt), licencia **CC0**.
  https://opengameart.org/content/first-light-particles-%E2%80%93-cc0-atmospheric-pianoambient-track

## Derechos de autor

Las texturas y la música oficiales de Minecraft son propiedad de Mojang / Microsoft
y C418. Este repositorio no incluye esos assets. Si quieres usar los oficiales,
hazlo con una copia que hayas obtenido legalmente y evita redistribuir el
repositorio públicamente con ellos.
