# Carte ANKOR

Carte du bar d'ANKOR en site web, dans la DA de la carte papier (« La carte d'exploration »).

## Structure

```
index.html        page de la carte
css/style.css     styles (papier crème, vert sapin, typo condensée)
js/main.js        construit la carte à partir du JSON
data/carte.json   le contenu de la carte (chapitres, catégories, articles, prix)
assets/img/       logo et illustrations du bar (à ajouter)
```

## Lancer en local

La page charge `data/carte.json` avec `fetch`, il faut donc passer par un petit serveur (l'ouvrir en double-cliquant ne marche pas) :

```bash
python3 -m http.server 8000
```

puis ouvrir http://localhost:8000

## Modifier la carte

Tout le contenu est dans `data/carte.json`. Champs d'un article :

| Champ         | Rôle                                                   |
|---------------|--------------------------------------------------------|
| `nom`         | nom affiché                                            |
| `prix`        | liste de prix, un par format (`null` = non proposé)    |
| `detail`      | contenance entre parenthèses, ex. `"4cl"`              |
| `description` | ligne de texte sous le nom                             |
| `tag`         | petite étiquette au-dessus (`"Pression"`, `"Bouteille"`) |
| `duMoment`    | ajoute « du moment »                                   |
| `vege`        | ajoute « (V) »                                         |
| `options`     | suppléments / variantes (`nom`, `description`, `prix`) |

Une catégorie peut avoir des `formats` (colonnes de prix) et un `style` : `bloc` (cadre + bandeau vertical, comme les provisions) ou `vedette` (cartes, comme les desserts).

## À venir

- Logo et illustrations officiels du bar
- Page d'administration pour modifier la carte
