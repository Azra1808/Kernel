/**
 * ⚠️ IMPORTANT — LIRE AVANT DE PRÉSENTER LE PROJET AU JURY ⚠️
 *
 * Ce fichier NE CONTIENT PAS de vrai modèle de machine learning. C'est un
 * mock temporaire, qui a exactement la même interface (entrée : URI d'une
 * photo ; sortie : maladie détectée + score de confiance) qu'aurait un
 * vrai modèle TFLite embarqué. Le but est de permettre de construire et
 * tester tout le reste du pipeline (caméra → analyse → résultat →
 * sauvegarde → synchronisation) sans attendre l'entraînement du modèle.
 *
 * La tâche n°10 du classeur ("Modèle de diagnostic des maladies (TFLite)")
 * n'est PAS terminée avec ce fichier — elle nécessite un vrai modèle
 * entraîné et converti en .tflite. Si l'app est soumise au jury avec ce
 * mock encore actif, il faut le dire clairement dans le pitch (ex. "le
 * pipeline de diagnostic est fonctionnel de bout en bout, le modèle final
 * reste à entraîner").
 *
 * COMMENT REMPLACER PAR UN VRAI MODÈLE :
 * 1. Trouver ou entraîner un modèle de classification (PlantVillage est
 *    le dataset public le plus courant, ~54 000 images, 38 classes).
 *    Des modèles pré-entraînés existent en PyTorch/TensorFlow sur
 *    HuggingFace — il faut les convertir en .tflite (tf.lite.TFLiteConverter
 *    côté TensorFlow, ou onnx-tf puis conversion, côté PyTorch).
 * 2. Ajouter le fichier .tflite dans assets/models/
 * 3. Installer une lib d'inférence on-device, ex. react-native-fast-tflite
 *    (`npx expo install react-native-fast-tflite`), qui nécessite un
 *    build natif (ne fonctionne pas dans Expo Go — "expo prebuild" ou
 *    EAS Build requis)
 * 4. Remplacer le corps de diagnosePlant() ci-dessous par un vrai appel
 *    au modèle chargé, en gardant EXACTEMENT la même signature de retour
 *    (PlantDiagnosisResult) — aucun autre fichier n'a besoin de changer.
 */

export type DiseaseSeverity = 'faible' | 'moyen' | 'eleve';

export interface DiseaseInfo {
  key: string;
  cropType: string;
  label: { fr: string; en: string };
  severity: DiseaseSeverity;
  advice: { fr: string; en: string };
}

/**
 * Base de connaissances des maladies couvertes par le mock. Un vrai
 * modèle retournerait un identifiant de classe (0 à 37 pour PlantVillage
 * par ex.) qu'il faudrait mapper vers cette même structure — le reste de
 * l'app (écran de résultat, sauvegarde, agrégation Écosystème) n'a besoin
 * de rien connaître de plus que "quelle maladie + quelle sévérité".
 */
export const DISEASE_LIBRARY: DiseaseInfo[] = [
  {
    key: 'manioc_sain',
    cropType: 'manioc',
    label: { fr: 'Manioc sain', en: 'Healthy cassava' },
    severity: 'faible',
    advice: {
      fr: 'Aucun signe de maladie détecté. Continue une surveillance régulière des feuilles.',
      en: 'No signs of disease detected. Keep monitoring the leaves regularly.',
    },
  },
  {
    key: 'manioc_mosaique',
    cropType: 'manioc',
    label: { fr: 'Mosaïque du manioc', en: 'Cassava mosaic disease' },
    severity: 'eleve',
    advice: {
      fr: "Maladie virale grave, transmise par un insecte (aleurode). Retire et détruis les plants atteints pour éviter la propagation. Utilise des boutures saines pour la prochaine plantation.",
      en: 'Serious viral disease spread by whiteflies. Remove and destroy affected plants to prevent spread. Use healthy cuttings for the next planting.',
    },
  },
  {
    key: 'manioc_bacteriose',
    cropType: 'manioc',
    label: { fr: 'Bactériose du manioc', en: 'Cassava bacterial blight' },
    severity: 'moyen',
    advice: {
      fr: 'Coupe et détruis les parties atteintes. Évite de travailler les plants après la pluie (la maladie se propage plus facilement quand les feuilles sont humides).',
      en: 'Cut and destroy affected parts. Avoid handling plants after rain (the disease spreads more easily on wet leaves).',
    },
  },
  {
    key: 'mais_sain',
    cropType: 'mais',
    label: { fr: 'Maïs sain', en: 'Healthy corn' },
    severity: 'faible',
    advice: {
      fr: 'Aucun signe de maladie détecté. Continue une surveillance régulière des feuilles.',
      en: 'No signs of disease detected. Keep monitoring the leaves regularly.',
    },
  },
  {
    key: 'mais_rouille',
    cropType: 'mais',
    label: { fr: 'Rouille du maïs', en: 'Corn rust' },
    severity: 'moyen',
    advice: {
      fr: "Taches orangées caractéristiques. Améliore l'espacement entre les plants pour une meilleure circulation d'air, et évite l'arrosage par aspersion sur les feuilles.",
      en: 'Characteristic orange spots. Improve spacing between plants for better airflow, and avoid overhead watering on the leaves.',
    },
  },
  {
    key: 'mais_helminthosporiose',
    cropType: 'mais',
    label: { fr: 'Helminthosporiose du maïs', en: 'Northern corn leaf blight' },
    severity: 'eleve',
    advice: {
      fr: "Lésions allongées grisâtres sur les feuilles. Retire les résidus de culture infectés après la récolte et alterne avec une culture différente la saison suivante.",
      en: 'Elongated grayish lesions on leaves. Remove infected crop residue after harvest and rotate with a different crop next season.',
    },
  },
];

export interface PlantDiagnosisResult {
  diseaseKey: string;
  cropType: string;
  diseaseLabel: string;
  severity: DiseaseSeverity;
  advice: string;
  /** Score de confiance du modèle, entre 0 et 1. */
  confidence: number;
}

/**
 * Point d'entrée unique du diagnostic. Signature pensée pour être
 * identique à ce qu'un vrai modèle TFLite exposerait — voir le bloc de
 * commentaire en haut du fichier pour le remplacer.
 *
 * @param imageUri URI locale de la photo (donnée par expo-camera ou
 *                 expo-image-picker)
 * @param language langue dans laquelle renvoyer le libellé/les conseils
 */
export async function diagnosePlant(
  imageUri: string,
  language: 'fr' | 'en'
): Promise<PlantDiagnosisResult> {
  // Simule un temps d'inférence réaliste (un vrai modèle TFLite sur
  // téléphone prend typiquement quelques centaines de ms à 1-2 secondes).
  await new Promise((resolve) => setTimeout(resolve, 900));

  // Sélection déterministe (mais qui varie d'une photo à l'autre) à
  // partir de l'URI de l'image, pour que les démos ne montrent pas
  // toujours EXACTEMENT le même résultat sur des photos différentes.
  const hash = hashString(imageUri);
  const disease = DISEASE_LIBRARY[hash % DISEASE_LIBRARY.length];

  // Confiance simulée entre 0.55 et 0.97 — volontairement jamais 100%,
  // un vrai modèle n'est jamais parfaitement sûr non plus.
  const confidence = 0.55 + (hash % 43) / 100;

  return {
    diseaseKey: disease.key,
    cropType: disease.cropType,
    diseaseLabel: disease.label[language],
    severity: disease.severity,
    advice: disease.advice[language],
    confidence: Math.round(confidence * 100) / 100,
  };
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}
