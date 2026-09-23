# Urbaniak — urbaniakimmo.com

Site vitrine de gestion de patrimoine immobilier. **HTML + CSS + JS statique, aucun build, aucun npm.**

## Lancer

```bash
cd /Users/dominika/urbaniak-immo && python3 -m http.server 8811
```
→ http://localhost:8811 · recharger avec **Cmd + Shift + R**.

## Structure

```
index.html            accueil (héros, audit, métiers, chiffres, destinations, typologies, la porte Sésame)
expertise.html        l'audit et le conseil
gestion.html          les usages et la gestion au quotidien
contact.html          formulaire
mentions-legales.html · confidentialite.html · credits.html
assets/               photographies (voir § Photographies)
css/style.css         tout le design (fichier unique)
js/main.js            défilement lissé, en-tête, panneau, apparitions
js/door.js            le passage vers Sesame Stays + l'arrivée depuis Sesame
```

## Design system

Structure, grille et rythme typographique repris de **passalacqua.it** ; palette et
fontes de la charte Urbaniak.

| | |
|---|---|
| Vert profond | `#2B3B33` — Pantone 5535 C |
| Or mat | `#B99B5F` — Pantone 4525 C |
| Encre | `#23241F` — Pantone Black 7 C |
| Ivoire | `#EFEDE8` — Pantone 9080 C |
| Blanc chaud | `#FBF9F4` |

**Titres** Cormorant Garamond 300/400 · **Courant et capitales** Jost 300/400.
Passalacqua utilise Canela et Switzer, sous licence propriétaire : les fontes de votre
charte les remplacent dans la même échelle (h1 70 px, h2 44 px, h3 26 px,
sur-titres 13 px capitales interlettrage 1 px, courant 16 px/1.5).

Variables dans `:root` en haut de `css/style.css` — les réutiliser, ne rien coder en dur.

## Bibliothèques (CDN)

GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.20 (défilement lissé, remplace le Locomotive
Scroll de passalacqua). ⚠️ Lenis n'existe pas sur cdnjs — il est servi par jsDelivr.

## La porte

`js/door.js` gère les deux sens :

- **Départ** — clic sur la porte (`#doorBtn`) ou sur tout lien `data-door` : les vantaux
  s'effacent, l'enfilade dorée apparaît, la lumière chaude envahit l'écran, puis
  redirection vers `sesamestays.com/?from=urbaniak`.
- **Arrivée** — si l'URL porte `?from=sesame`, la lumière chaude occupe l'écran au
  chargement puis se retire vers la porte. Le paramètre est ensuite retiré de l'URL.

`prefers-reduced-motion` court-circuite l'animation et redirige directement.

## Photographies

Les visuels viennent de **Wikimedia Commons**, sous licences libres (CC BY, CC BY-SA,
domaine public). Auteurs et licences sont listés sur `credits.html` — page obligatoire
au titre des conditions d'attribution, **ne pas la supprimer**.

Ce sont des images d'illustration : elles montrent Paris, Saint-Tropez, Monaco et
Deauville, pas les biens réels. À remplacer par vos reportages dédiés — il suffit de
récrire les fichiers dans `assets/` en gardant les mêmes noms, puis de retirer les
crédits devenus inutiles.

## Ce qu'il reste à faire

- **Photos définitives** : remplacer les fichiers d'`assets/` (mêmes noms), puis mettre
  `credits.html` à jour.
- **Formulaire de contact** : `action="#"` — c'est un gabarit, il faut brancher un
  service d'envoi.
- **Téléphone** : `+33 (0)1 XX XX XX XX` est un espace réservé, dans les pieds de page,
  la page contact et les mentions légales.
- **Mentions légales et confidentialité** : les textes sont rédigés et complets ; les
  passages surlignés (`<em class="tbd">`) attendent vos informations exactes — RCS, carte
  professionnelle, garantie financière, assureur, hébergeur, médiateur.
- **Mobile** : vérifié sans débordement horizontal sur les 7 pages, mais Chrome headless
  bloque le viewport à 485 px — contrôler le rendu sous 480 px dans un vrai navigateur.

## Déploiement

`vercel.json` est prêt (`cleanUrls`). Site statique, rien à construire.
