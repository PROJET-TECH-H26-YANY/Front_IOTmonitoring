# Documentation de Mise en Service - Application Mobile (Front-end)

Ce guide décrit les étapes pour installer, configurer et lancer l'application mobile de gestion d'assiduité IoT. Le projet est développé avec React Native et Expo.

## 1. Prérequis
- **Node.js** (version LTS recommandée) installé sur votre machine.
- L'application **Expo Go** installée sur votre téléphone physique (disponible sur iOS et Android), ou un émulateur configuré (Android Studio / Xcode).
- L'API Backend doit être en cours d'exécution.

## 2. Installation du projet
Ouvrez un terminal et exécutez les commandes suivantes :

```bash
# 1. Cloner le dépôt front-end
git clone https://github.com/PROJET-TECH-H26-YANY/Front_IOTmonitoring.git
cd frontend

# 2. Installer les dépendances
npm install
```

## 3. Configuration de l'environnement (.env)
L'application doit savoir où contacter l'API. Vous devez créer un fichier `.env` à la racine du dossier frontend.

```bash
nano .env
```

**Contenu du fichier `.env` :**
```env
# Remplacez par l'URL ou l'IP de votre API Backend
EXPO_PUBLIC_API_URL=http://VOTRE_ADRESSE_IP:3000
```

 **ATTENTION IMPORTANTE POUR L'ÉVALUATION :**
- Si vous testez avec un **émulateur**, vous pouvez utiliser `http://10.0.2.2:3000` (Android) ou `http://localhost:3000` (iOS).
- Si vous testez avec **votre téléphone physique via Expo Go**, `localhost` ne fonctionnera pas. Vous devez utiliser l'adresse IP locale de votre ordinateur sur le réseau Wi-Fi (ex: `http://192.168.1.50:3000`) ou le nom de domaine si l'API est déployée en ligne (ex: `https://api.iot.y-any.org`).

## 4. Lancement de l'application
Une fois le fichier `.env` configuré, lancez le serveur Expo :

```bash
npm start
```

Un QR code va s'afficher dans votre terminal.

## 5. Tests fonctionnels
1. **Sur téléphone physique :** - Connectez votre téléphone au **même réseau Wi-Fi** que votre ordinateur.
   - Ouvrez l'application **Expo Go**.
   - Scannez le QR code affiché dans le terminal.
2. **Sur émulateur :**
   - Dans le terminal où tourne Expo, appuyez sur la touche `a` pour ouvrir sur Android, ou `i` pour iOS.

## 6. Validation
- Si la page de connexion s'affiche, l'application est bien lancée.
- Connectez-vous avec le compte administrateur créé via l'API pour vérifier que la communication avec le backend est fonctionnelle.




## 8. Guide de Test et Validation (De bout en bout)

Pour valider que le système complet fonctionne (Étape 7 du rapport de mise en service), suivez ce scénario de test :

### A. Démarrage de l'objet connecté (ESP32)
1. Branchez l'ESP32 via le câble USB pour l'alimenter.
2. L'ESP32 est déjà programmé pour se connecter au Wi-Fi du laboratoire et pointer vers le serveur MQTT.
3. Observez l'écran OLED ou la LED pour confirmer qu'il est en attente de scan.

### B. Scénario sur l'application mobile
1. **Inscription / Connexion :** - Ouvrez l'application mobile.
   - Créez un compte "Professeur" via l'écran d'inscription (Register).
   - Connectez-vous avec ce compte.
2. **Création d'un étudiant :**
   - Allez dans l'onglet "Gestion des étudiants".
   - Ajoutez un étudiant test (ex: "Test Yany") et assignez-lui l'UID NFC de la carte de test fournie.
3. **Simulation d'une session (Interaction Objet <-> API) :**
   - Allez sur l'onglet "Dashboard Live".
   - Prenez la carte NFC et passez-la sur le lecteur de l'ESP32.
   - **Résultat attendu :** L'ESP32 envoie l'information au MQTT, l'API la traite, et la session de l'étudiant doit apparaître instantanément sur votre écran d'application mobile en statut "Active".
4. **Fermeture de session :**
   - Depuis l'application mobile, cliquez sur "Forcer la fermeture" de la session.
   - **Résultat attendu :** L'API envoie une commande MQTT à l'ESP32, la LED/l'écran de l'objet doit indiquer "Fermeture Forcée".

### C. Dépannage rapide (Troubleshooting)
- **Si l'application affiche "Network Error" :** Vérifiez que l'adresse IP dans le fichier `.env` du front-end est bien celle de l'ordinateur qui héberge l'API (pas `localhost` si vous êtes sur un téléphone physique).
- **Si l'ESP32 ne réagit pas :** Vérifiez que le port `1883` est bien ouvert et que Mosquitto tourne (`sudo systemctl status mosquitto`).