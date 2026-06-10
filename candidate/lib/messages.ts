export const messages = {
  apply: {
    movedToLibrary:
      'La candidature se fait maintenant avec un CV enregistré dans votre bibliothèque.',
    missingOffer: 'Cette offre a peut-être été supprimée.',
    sent: 'Candidature envoyée.',
  },
  cv: {
    uploadPdfOnly: 'Seuls les fichiers PDF sont pris en charge.',
    uploadTooLarge: 'La taille du fichier doit être inférieure à 5 Mo.',
    uploaded: 'CV téléversé.',
    uploadFailed: 'Échec du téléversement du CV.',
    invalidFileRef: 'Référence de fichier CV invalide.',
    downloaded: 'CV téléchargé.',
    downloadFailed: 'Échec du téléchargement du CV.',
    defaultUpdated: 'CV par défaut mis à jour.',
    defaultFailed: 'Échec de la mise à jour du CV par défaut.',
    deleted: 'CV supprimé.',
    deleteFailed: 'Échec de la suppression du CV.',
    selectedMissing: 'Le CV sélectionné est introuvable.',
    selectedLoadFailed: 'Impossible de charger le CV sélectionné.',
  },
  profile: {
    logoutTitle: 'Se déconnecter',
    logoutDescription: 'Vous pourrez vous reconnecter à tout moment avec vos identifiants.',
    logoutConfirm: 'Se déconnecter',
    logoutDone: 'Déconnexion réussie.',
    deleteAccountTitle: 'Supprimer le compte',
    deleteAccountDescription:
      'Cette action est définitive. Vos données, CV et candidatures seront supprimés.',
    deleteAccountConfirm: 'Supprimer mon compte',
    deletePasswordRequired: 'Le mot de passe est requis.',
    accountDeleted: 'Compte supprimé.',
    accountDeleteFailed: 'Erreur lors de la suppression du compte.',
  },
  notifications: {
    markAllFailed: 'Échec du marquage des notifications comme lues.',
    markOneFailed: 'Échec du marquage de la notification.',
    deleted: 'Notification supprimée.',
    deleteFailed: 'Échec de la suppression de la notification.',
    undo: 'Annuler',
  },
  pwa: {
    copied: 'Lien copié.',
    copyFallback: "Copiez l'adresse depuis la barre du navigateur, puis ouvrez-la dans Safari.",
    copyTitle: 'Copier le lien',
    copyDescription:
      "Le lien sera copié pour que vous puissiez l'ouvrir dans Safari et installer l'application.",
    copyConfirm: 'Copier le lien',
  },
  socket: {
    analysisReady: (jobTitle: string) => `Correspondance mise à jour pour ${jobTitle}`,
  },
} as const
