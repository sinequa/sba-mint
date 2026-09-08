# Guide développeur — Changesets

Ce dépôt utilise [Changesets](https://github.com/changesets/changesets) pour générer `CHANGELOG.md` automatiquement à partir des PR. Contrairement à `atomic`/`atomic-angular`, Mint est une **application déployée**, pas une librairie publiée sur npm :

> **Règle d'or** : on ne modifie **jamais** `version` dans `package.json` à la main pour une histoire de changelog — ce champ est **figé**, propriété de l'équipe produit (il change uniquement quand la vraie version de Mint change). Changesets ne sert ici qu'à générer `CHANGELOG.md`, jamais à bumper `version`, jamais à publier, jamais à taguer.

**Activé sur `release/11.14.0` uniquement pour l'instant** (voir §F).

## Vue d'ensemble

Deux rôles :

- **Développeur** (sur chaque MR) → écrit un *changeset* décrivant son changement. C'est tout.
- **CI** (à chaque push sur `release/11.14.0`) → agrège les changesets en attente dans une MR « chore: version packages ».

---

## A. Cycle quotidien (développeur)

### Étape 1 — Développer normalement

```bash
git checkout -b fix/ES-XXXXX-description
# ... code ...
```

### Étape 2 — Créer un changeset

```bash
npm run changeset
```

Comme le dépôt ne contient qu'un seul package (`sinequa-mint`), l'outil demande directement le type de bump et un résumé.

> `npm run changeset` est **interactif** — inutilisable en session Claude Code. Créer directement le fichier `.changeset/<trois-mots-au-hasard>.md` à la main, même format :

```md
---
"sinequa-mint": patch
---

Fix the empty-search guard incorrectly hiding active collections on the home page.
```

- **Bump** : `patch` = correction · `minor` = nouvelle fonctionnalité rétrocompatible · `major` = changement notable/breaking côté utilisateur. **Ce choix n'a aucun effet sur le numéro de version réel de Mint** — il détermine uniquement sous quelle section (`Major/Minor/Patch Changes`) l'entrée apparaît dans `CHANGELOG.md`. Choisir selon l'impact perçu par l'utilisateur, pas selon une intention semver.
- **Résumé** : en **anglais**, au présent, orienté utilisateur — pas un message de commit. Il atterrit tel quel dans `CHANGELOG.md`.
- **Un changeset par changement fonctionnel** : une MR qui regroupe deux correctifs distincts en contient deux.
- **Vérifier** avant de commiter : `npm run changeset:status` doit lister le changeset.

### Étape 3 — Commiter le changeset avec la feature

```bash
git add .changeset/<nom>.md
git commit -m "ES-XXXXX fix(search): ..."
git push -u origin fix/ES-XXXXX-description
```

### Étape 4 — Ouvrir la MR vers `release/11.14.0`

La CI `changeset-check` vérifie qu'un changeset est présent :

- ✅ présent → check vert.
- ❌ absent → check rouge.

---

## B. Exception : MR sans changelog (docs, CI, chore)

Si la MR ne produit pas de changement notable pour l'utilisateur, ajouter `#skip-changeset` dans le **titre de la MR** (même logique que `#noJiraCheck`) :

```
ES-XXXXX #done chore: bump eslint config #skip-changeset
```

> **GitLab** : si le check a déjà tourné en rouge, éditer le titre après coup ne suffit pas — GitLab n'évalue les `rules` qu'à la création du pipeline. Relancer le pipeline de la MR (« Run pipeline »), ou pousser un nouveau commit.

---

## C. Accumulation et génération du CHANGELOG

Chaque MR mergée apporte son propre changeset ; ils s'accumulent dans `.changeset/`. À chaque push sur `release/11.14.0`, la CI `changeset-release` (re)crée/actualise une MR **« chore: version packages »** qui :

1. Bump `version` en interne (calcul de bump changesets, valeur **jetée**, jamais commitée telle quelle).
2. Écrit/complète `CHANGELOG.md` à partir des changesets en attente.
3. **Restaure** `version` à sa valeur figée (`11.14.0`).
4. Incrémente `buildVersion` (voir §D) et l'utilise comme titre de section dans `CHANGELOG.md`, au lieu du faux numéro semver calculé à l'étape 1.
5. Supprime les fichiers `.changeset/*.md` consommés.

Cette MR de version se merge comme n'importe quelle autre — pas de geste de publication supplémentaire (pas de `npm publish`, pas de tag Git créé par cet outillage).

---

## D. `buildVersion` — le compteur de ce dépôt

`package.json` porte deux champs distincts :

| Champ | Qui le pilote | Ce qu'il représente |
|---|---|---|
| `version` | Équipe produit, à la main, rarement | La vraie version de Mint (`11.14.0`) — **jamais** touchée par cet outillage |
| `buildVersion` | CI `changeset-release`, jamais à la main | `X.Y.Z-N` (identifiant de pre-release semver-valide) — compteur de ce dépôt, incrémenté à chaque génération de `CHANGELOG.md` |

`buildVersion` recopie toujours le préfixe `X.Y.Z` de `version` : si l'équipe produit bump `version` à la main, le run `changeset-release` suivant repart automatiquement sur `X.Y.Z-0`.

Ce compteur est indépendant des tags `es-X.Y.Z.N` (poussés par un système externe — build nocturne du produit ES, sans rapport avec les merges Mint). Le tag `es-*` le plus proche est simplement mentionné à titre indicatif sous chaque nouveau titre de `CHANGELOG.md`, pour la traçabilité support/QA — il ne pilote rien.

---

## E. Aide-mémoire des commandes

```bash
npm run changeset          # créer un changeset (dans chaque MR avec un changement notable)
npm run changeset:status   # voir les changesets en attente
npm run changeset:version  # (CI uniquement) appliquer le bump + générer le CHANGELOG
```

**Règle d'or** : une MR avec un changement notable pour l'utilisateur = **un changeset** (ou `#skip-changeset` dans le titre sinon).

---

## F. Périmètre actuel et lignes de release

Le système n'est activé que sur `release/11.14.0` pour l'instant — `release/11.12.0` et `release/11.13.0` n'ont ni `.changeset/`, ni `CHANGELOG.md`, ni les jobs CI correspondants. Le merge routinier `release/11.13.0` → `release/11.14.0` n'en est pas affecté (ces fichiers n'existent que côté `11.14.0`, aucun conflit).

À l'ouverture d'une nouvelle ligne (`release/11.15.0`, dérivée de `11.14.0`) :

- Les jobs CI (`changeset-check`, `changeset-release`) sont écrits en générique (`release/*`) et fonctionnent sans modification.
- Mettre à jour `baseBranch` dans `.changeset/config.json` : `"release/11.14.0"` → `"release/11.15.0"`.
- Mettre à jour la cible de `changeset-check` dans `.gitlab-ci.yml` (actuellement `release/11.14.0` en dur, pour rester scopé à une seule ligne active).
