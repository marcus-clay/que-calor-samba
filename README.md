# Que Calor — Partition Samba-Reggae

Application web monopage (HTML/CSS/JS vanilla, zéro dépendance) qui affiche une
partition rythmique interactive pour un orchestre Samba-Reggae. Elle synchronise
des blocs lumineux sur chaque ligne d'instrument avec l'audio, via Web Audio API.

## Déploiement

100 % statique, aucun backend. Servi tel quel par Vercel (`vercel.json`).

Pour activer le son, placer le fichier audio `MASTER_4_QUE_CALOR.m4a` à la racine,
à côté de `index.html`. Sans ce fichier, l'app fonctionne en mode dégradé
(visuels seuls, clock `performance.now()`).

## Contraintes

- Zéro framework, zéro build step : tout reste dans `index.html`.
- Le clock Web Audio est le seul maître de la synchronisation visuelle.
- Géométrie de grille partagée entre CSS vars et constantes JS (cohérence à maintenir).
