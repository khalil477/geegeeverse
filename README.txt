GEEGEEVERSE — CAMPUS MAP TEST ADD-ON
====================================

This ADD-ON provides a separate page for the Three.js campus prototype.
It does not overwrite the existing multiplayer game, avatar studio or server.

UPLOAD TO GITHUB:
1) Extract this zip on your computer.
2) Open your repo's existing public/ folder on GitHub.
3) Choose Add file > Upload files.
4) Upload these TWO files directly into public/:
   campus-demo.html
   campus-demo.js
5) Commit changes. After Render says Live, open:
   https://geegeeverse.onrender.com/campus-demo.html
6) To return to your normal game, use the Back to original game button.

NOTE: The map is a stylized proof of concept with representative
buildings, not an accurate full 3D replica of the University of Ottawa.

IMPORTANT: The separate HTML and JS files are necessary because the
existing game's Content-Security-Policy blocks inline JavaScript.
The 3D engine is loaded from jsDelivr (Three.js); all campus models are
created directly in code with no external image/model assets.

NOT IMPLEMENTED IN THIS ADD-ON:
- Multiplayer or 3D cartoon avatars inside this experimental page
- Accurate uOttawa building placements or architectural models
- Classroom, chat, quest or voice features in this experimental page

This intentionally leaves those working features in your existing main game.
