# Que Calor — Bibliothèque de partitions Samba-Reggae

App d'apprentissage rythmique : on dépose un morceau, on obtient une partition
lumineuse synchronisée à l'audio, par instrument. Cible : un musicien débutant
suit sa ligne sans lire le solfège.

## Décisions d'architecture (verrouillées)

Ces décisions supersèdent la contrainte initiale « un seul .html, zéro
dépendance » du brief d'origine. Choix assumé pour passer d'une démo à un produit.

| Sujet | Décision | Pourquoi |
|---|---|---|
| Modèle | Bibliothèque partagée multi-morceaux | Un produit, pas une démo jetable |
| Frontend | Vanilla JS, 2 écrans (Index + Partition) | Fidèle à l'esprit « pas de framework » |
| Backend | Vercel Blob (audio) + Vercel KV (index + analyse) | Stockage partagé sans serveur dédié |
| Accès | Mot de passe partagé (passphrase orchestre) | Simple, suffisant pour un groupe fermé |
| **Frappes** | **Patterns canoniques + éditeur de validation humaine** | La détection auto seule ne dépasse pas ~80 % sur les surdos qui se chevauchent. Inacceptable pour l'apprentissage. La précision vient d'un humain qui valide. |
| Analyse navigateur | Tempo, grille de beats, sections seulement | Cale les patterns sur l'audio, n'invente pas les frappes |
| Clock | Web Audio `AudioContext.currentTime`, seul maître | Zéro drift, pas de `setInterval` pour les visuels |

## Vérité technique à retenir

Restituer chaque frappe avec précision depuis un seul mixage stéréo de l'orchestre
n'est PAS résoluble automatiquement : les trois surdos se chevauchent en fréquence,
la séparation de sources ML (demucs) n'isole pas surdo-1 de surdo-2, et les modèles
de transcription de batterie ne connaissent pas la taxonomie samba. Donc :
la détection produit un brouillon, l'humain garantit la justesse.

## Plan par phases

- **Phase 0 — Refactor moteur** : `D` mutable, `buildScore()` reconstructible.
  L'app mono-fichier reste fonctionnelle. ✅
- **Phase 1 — Éditeur de validation** : mode édition, clic sur cellule cycle
  repos / medium / accent par instrument et par beat, export JSON des patterns.
  Cœur de la précision.
- **Phase 2 — Analyse d'alignement** : moteur navigateur tempo + grille + sections,
  correction de tempo ×2 / ÷2 (erreurs d'octave).
- **Phase 3 — Bibliothèque + 2 écrans** : Index + Partition, persistance locale
  IndexedDB d'abord (étape de dev vers le backend partagé).
- **Phase 4 — Backend partagé** : Vercel Blob + KV + routes API + mot de passe.
  Migration de la persistance locale vers partagée.
- **Phase 5 — Patterns canoniques** : patterns traditionnels par instrument,
  appliqués et alignés comme point de départ d'édition.

## Stack de déploiement

Vercel, scope « Hugo's projects ». Repo GitHub `marcus-clay/que-calor-samba`.
Passe de statique à Node (package.json + /api + /public) en Phase 4.

## Coûts à surveiller

Blob + KV ont un palier gratuit, mais l'audio (~11 Mo/morceau) en stockage et
bande passante finit par être facturé. À garder à l'œil.
