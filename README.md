# Studieäventyret – Vasatiden (beta 1.5)

En statisk studieapp för webbläsare. Inga konton, ingen databas, ingen installation.

## Funktioner
- Quiz med slumpad frågeordning **och** slumpade svarsalternativ vid varje ny omgång.
- Upp till 12 frågor per omgång; frågebanken kan byggas ut i `data/vasatiden.js`.
- Para ihop begrepp och förklaringar, provfrågor med stödord.
- Svensk uppläsning via webbläsarens talsyntes (röster varierar mellan enheter).
- Fem färgteman, valfri glittereffekt och frivilliga, lugna rörelsepauser.
- Val och provsvar sparas lokalt i webbläsaren.

## Publicera med GitHub Pages
1. Skapa ett nytt **publikt** repository på GitHub, exempelvis `studieaventyret`.
2. Ladda upp **innehållet** i denna mapp till repositoryts rot: `index.html`, `style.css`, `app.js`, `data/`, `.nojekyll` och `README.md`.
3. Öppna **Settings → Pages** och välj **Deploy from a branch**, branch `main`, folder `/ (root)`. Spara.
4. När publiceringen är klar hittar du länken under Pages, normalt `https://DITT-NAMN.github.io/studieaventyret/`.

**Obs:** GitHub Pages-webbplatsen blir offentlig. Lägg inte upp elevuppgifter, personuppgifter eller lärarens originalmaterial. Innehållet är fristående övningsfrågor.

## Testa lokalt
Öppna `index.html` via en lokal webbserver (t.ex. `python -m http.server 8000` i mappen och sedan `http://localhost:8000`). Filerna använder vanliga script-taggar och fungerar ofta också direkt från disk.

## Nästa steg
Flytta frågebanken till ett generellt ämnesformat, utöka antalet frågor och testa på telefon/surfplatta. Ingen server eller AI-nyckel behövs för denna beta.
--
