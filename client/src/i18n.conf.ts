import { I18nConfiguration } from '@aurelia/i18n';
// import Fetch from 'i18next-fetch-backend';

const i18nConf = () => {
  return I18nConfiguration.customize((options) => {
    options.initOptions = {
      // plugins: [Fetch],
      // backend: {
      //   loadPath: '/locales/{{lng}}/{{ns}}.json',
      // },
      defaultNS: 'global',
      ns: 'global',
      fallbackLng: 'en',
      lng: 'fr',
      whitelist: ['en', 'fr'],
      resources: {
        en: { global: en },
        fr: { global: fr }
      },
      debug: false
    };
  });
}

export { i18nConf };

const en = {
  "welcome": {
    "slogan": "Together in prayer. Wherever. Whenever."
  },
  "misc": {
    "Terms of use": "Terms of use",
    "Privacy Policy": "Privacy Policy"
  },
  "fields": {
    "Mobile": "Mobile",
    "Your password": "Your password"
  },
  "buttons": {
    "Create an account": "Create an account",
    "Login": "Login"
  },
  "topics": {
    "Active": "Active",
    "Answered": "Answered",
    "Archived": "Archived",
    "Loading topics": "Loading topics",
    "Use this button to add prayer topics and start enjoying Sunago": "Use this button to add prayer topics and start enjoying Sunago.",
    "Click here to start praying for your active topics": "Click here to start praying for your active topics."
  },
  "topicForm": {
    "New Topic": "New Topic",
    "Edit Topic": "Edit Topic",
    "What do you want to say to God ?": "What do you want to say to God ?",
    "Illustrate your topic": "Illustrate your topic",
    "Color": "Color",
    "Picture": "Picture",
    "Select an image": "Select an image",
    "Remove image": "Remove image"
  },
  "topicDetail": {
    "Answered {{ date }}": "Answered {{ date }}",
    "Messages": "Messages",
    "Shares": "Shares",
    "Mark as answered": "Mark as answered",
    "Mark as active": "Mark as active",
    "Archive": "Archive",
    "Make active": "Make active",
    "Remove topic": "Remove topic"
  },
  "conversation": {
    "Write your message": "Write your message"
  },
  "praying": {
    "Write your message": "Write your message"
  },
  "activity": {
    "Loading activities": "Loading activities",
    "Use this switch to toggle your own activity": "Use this switch to toggle your own activity.",
    "On this screen you'll find what's happening in your prayer community": "On this screen you'll find what's happening in your prayer community."
  },
  "account": {
    "Edit my profile": "Edit my profile",
    "Manage my Friends": "Manage my Friends",
    "View my praying stats": "View my praying stats",
    "Notifications settings": "Notifications settings",
    "Contact Us": "Contact Us",
    "Logout": "Logout",
    "Version: {{ versionNb }}": "Version: {{ versionNb }}"
  },
  "profile": {
    "Change profile picture": "Change profile picture",
    "Firstname": "Firstname",
    "Lastname": "Lastname"
  },
  "avatar": {
    "Select an image": "Select an image",
    "Or pick one below": "Or pick one below"
  },
  "friends": {
    "Friends": "Friends",
    "Search friends": "Search friends",
    "Search with mobile or email": "Search with mobile or email",
    "Request": "Request",
    "requested": "Requested",
    "Friends Requests": "Friends Requests",
    "Decline": "Decline",
    "Accept": "Accept",
    "Use the Search button to find friends": "Use the Search button to find friends. Then you'll be able to share your prayer topics with them."
  },
  "and": "and",
  "Save": "Save",
  "Close": "Close",
  "Cancel": "Cancel",
  "Confirm cancel": "Confirm cancel",
  "Edit": "Edit",
  "Remove": "Remove",
  "Confirm remove": "Confirm remove",
  "Delete": "Delete",
  "Continue": "Continue",
  "Back": "Retour",
  "Search": "Search"
};


const fr = {
  "welcome": {
    "slogan": "Ensemble en prière. N'importe où. N'importe quand."
  },
  "misc": {
    "Terms of use": "Conditions d'utilisations",
    "Privacy Policy": "Politique de confidentialité"
  },
  "fields": {
    "Mobile": "N° de Mobile",
    "Your password": "Ton mot de passe"
  },
  "buttons": {
    "Create an account": "Créer un compte",
    "Login": "Se connecter"
  },
  "topics": {
    "Active": "Actifs",
    "Answered": "Répondus",
    "Archived": "Archivés",
    "Loading topics": "Chargement des sujets",
    "Use this button to add prayer topics and start enjoying Sunago": "Utilise ce bouton pour ajouter un sujet de prière et profiter de Sunago.",
    "Click here to start praying for your active topics": "Clic ici pour commencer à prier pour tes sujets actifs."
  },
  "topicForm": {
    "New Topic": "Nouveau sujet",
    "Edit Topic": "Modifier le sujet",
    "What do you want to say to God ?": "Qu'est-ce que tu veux dire à Dieu ?",
    "Illustrate your topic": "Illustre ton sujet",
    "Color": "Couleur",
    "Picture": "Image",
    "Select an image": "Choisis une image",
    "Remove image": "Enlève l'image"
  },
  "topicDetail": {
    "Answered {{ date }}": "Répondu {{ date }}",
    "Messages": "Messages",
    "Shares": "Partages",
    "Mark as answered": "Marqué comme répondu",
    "Mark as active": "Rendre actif",
    "Archive": "Archiver",
    "Make active": "Rendre actif",
    "Remove topic": "Supprimer le sujet"
  },
  "conversation": {
    "Write your message": "Ecris ton message"
  },
  "praying": {
    "Write your message": "Ecris ton message"
  },
  "activity": {
    "Loading activities": "Chargement des activités",
    "Use this switch to toggle your own activity": "Utilise ce bouton pour afficher / ou pas, ton activité.",
    "On this screen you'll find what's happening in your prayer community": "Sur cet écran tu trouvera ce qui se passe dans ta communauté de prière."
  },
  "account": {
    "Edit my profile": "Editer mon profil",
    "Manage my Friends": "Gérer mes amis",
    "View my praying stats": "Voir mes statistique de prière",
    "Notifications settings": "Paramètres de notifications",
    "Contact Us": "Nous contacter",
    "Logout": "Se déconnecter",
    "Version: {{ versionNb }}": "Version: {{ versionNb }}"
  },
  "profile": {
    "Change profile picture": "Changer d'image de profil",
    "Firstname": "Prénom",
    "Lastname": "Nom de famille"
  },
  "avatar": {
    "Select an image": "Choisir une image",
    "Or pick one below": "Ou choisis-en une ci-dessous"
  },
  "friends": {
    "Friends": "Amis",
    "Search friends": "Rechercher des amis",
    "Search with mobile or email": "Rechercher avec n° de mobile ou email",
    "Request": "Demander",
    "requested": "Demandé",
    "Friends Requests": "Demandes d'amis",
    "Decline": "Refuser",
    "Accept": "Accepter",
    "Use the Search button to find friends": "Utilise le bouton de recherche pour trouver des amis. Ensuite tu pourra partager tes sujets de prière avec eux."
  },
  "and": "et",
  "Save": "Enregistrer",
  "Close": "Fermer",
  "Cancel": "Annuler",
  "Confirm cancel": "Confirmer annulation",
  "Edit": "Modifier",
  "Remove": "Retirer",
  "Confirm remove": "Confirmer",
  "Delete": "Supprimer",
  "Continue": "Poursuivre",
  "Search": "Rechercher"
};
