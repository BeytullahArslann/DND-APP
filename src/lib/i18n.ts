import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  tr: {
    translation: {
      common: {
        save: "Kaydet",
        cancel: "İptal",
        delete: "Sil",
        edit: "Düzenle",
        loading: "Yükleniyor...",
        error: "Hata",
        success: "Başarılı",
        back: "Geri"
      },
      auth: {
        title: "Zindan Ustası",
        subtitle: "Maceralarını yönet, zarlarını at ve efsaneni yaz.",
        google_signin: "Google ile Giriş Yap",
        terms: "Giriş yaparak kullanım koşullarını kabul etmiş sayılırsınız.",
        unauthorized_domain: "Bu alan adı (domain) Firebase Console'da yetkilendirilmemiş.",
        popup_closed: "Giriş penceresi kapatıldı.",
        login_error_prefix: "Giriş yapılırken bir hata oluştu: "
      },
      sidebar: {
        home: "Ana Sayfa",
        chat: "Sohbet",
        profile: "Profilim",
        logout: "Çıkış Yap",
        add_room: "Oda Ekle"
      },
      dashboard: {
        lobby: "Lobi",
        hub: "Oyun Merkezi (Hub)",
        lobby_desc: "Yeni bir maceraya başla veya mevcut birine katıl.",
        hub_desc: "Tüm açık oyunları keşfet.",
        my_lobby: "Lobime Dön",
        all_games: "Tüm Oyunlar",
        join_code: "Kod İle Katıl",
        new_room: "Yeni Oda",
        search_room: "Oda adı ara...",
        no_rooms: "Oda bulunamadı.",
        friend_requests: "Arkadaş İstekleri",
        friends: "Arkadaşların",
        invites: "Bekleyen Oyun Davetleri",
        no_requests: "Bekleyen istek yok.",
        no_friends: "Henüz arkadaş eklemedin.",
        no_invites: "Bekleyen davet yok.",
        invited_by: "Davet eden:",
        accept: "Kabul Et",
        reject: "Reddet",
        join: "Katıl",
        players: "Oyuncu",
        online: "Çevrimiçi"
      },
      profile: {
        title: "Profil Düzenle",
        upload_photo: "Fotoğraf Yükle",
        max_size: "Max 5MB (JPG, PNG, GIF)",
        username: "Kullanıcı Adı",
        bio: "Hakkında",
        bio_placeholder: "Kendinizden bahsedin...",
        language: "Dil / Language",
        upload_error: "Fotoğraf yüklenirken hata oluştu.",
        size_error: "Dosya boyutu 5MB'dan küçük olmalıdır."
      },
      chat: {
        room_chat: "Oda Sohbeti",
        friends_chat: "Arkadaşlar",
        add_friend_placeholder: "Arkadaş E-posta",
        no_friends_msg: "Arkadaş yok.",
        placeholder: "Mesaj yaz...",
        user_not_found: "Kullanıcı bulunamadı.",
        self_add_error: "Kendini ekleyemezsin.",
        already_friends: "Zaten arkadaşsınız.",
        request_sent: "Arkadaşlık isteği gönderildi!",
        upload_fail: "Yükleme başarısız.",
        file_too_large: "Dosya boyutu çok büyük (Max 5MB)."
      },
      room_modal: {
        create_title: "Yeni Oda Oluştur",
        room_name: "Oda Adı",
        room_name_placeholder: "Ejderha Mızrağı",
        password: "Şifre (İsteğe Bağlı)",
        password_placeholder: "Boş bırakılırsa onayla giriş yapılır",
        password_hint: "Şifre belirlerseniz, şifreyi bilen herkes girebilir. Şifre yoksa, her katılım isteğini onaylamanız gerekir.",
        create_btn: "Oluştur",
        join_title: "Odaya Katıl",
        room_id: "Oda ID",
        room_id_placeholder: "Oda kodunu girin",
        password_if_any: "Şifre (Varsa)",
        role_select: "Rol Seçimi",
        role_player: "Oyuncu",
        role_spectator: "İzleyici",
        role_dm: "DM (Yönetici)",
        join_btn: "Katıl / İstek Gönder",
        error_not_found: "Oda bulunamadı.",
        error_wrong_password: "Hatalı şifre.",
        error_already_requested: "Zaten istek gönderilmiş.",
        success_request: "Katılım isteği gönderildi. Oda sahibi onayladığında girebileceksiniz."
      },
      error_page: {
        title: "Bir Hata Oluştu!",
        default_msg: "Beklenmedik bir hata ile karşılaştık.",
        back_home: "Ana Sayfaya Dön"
      }
    }
  },
  en: {
    translation: {
      common: {
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        back: "Back"
      },
      auth: {
        title: "Dungeon Master",
        subtitle: "Manage adventures, roll dice, and write your legend.",
        google_signin: "Sign in with Google",
        terms: "By signing in, you agree to the terms of use.",
        unauthorized_domain: "This domain is not authorized in Firebase Console.",
        popup_closed: "Sign-in popup was closed.",
        login_error_prefix: "An error occurred during sign-in: "
      },
      sidebar: {
        home: "Home",
        chat: "Chat",
        profile: "My Profile",
        logout: "Logout",
        add_room: "Add Room"
      },
      dashboard: {
        lobby: "Lobby",
        hub: "Game Hub",
        lobby_desc: "Start a new adventure or join an existing one.",
        hub_desc: "Discover all public games.",
        my_lobby: "Back to Lobby",
        all_games: "All Games",
        join_code: "Join with Code",
        new_room: "New Room",
        search_room: "Search room name...",
        no_rooms: "No rooms found.",
        friend_requests: "Friend Requests",
        friends: "Friends",
        invites: "Pending Game Invites",
        no_requests: "No pending requests.",
        no_friends: "No friends added yet.",
        no_invites: "No pending invites.",
        invited_by: "Invited by:",
        accept: "Accept",
        reject: "Reject",
        join: "Join",
        players: "Players",
        online: "Online"
      },
      profile: {
        title: "Edit Profile",
        upload_photo: "Upload Photo",
        max_size: "Max 5MB (JPG, PNG, GIF)",
        username: "Username",
        bio: "Bio",
        bio_placeholder: "Tell us about yourself...",
        language: "Language",
        upload_error: "Error uploading photo.",
        size_error: "File size must be less than 5MB."
      },
      chat: {
        room_chat: "Room Chat",
        friends_chat: "Friends",
        add_friend_placeholder: "Friend Email",
        no_friends_msg: "No friends.",
        placeholder: "Type a message...",
        user_not_found: "User not found.",
        self_add_error: "You cannot add yourself.",
        already_friends: "You are already friends.",
        request_sent: "Friend request sent!",
        upload_fail: "Upload failed.",
        file_too_large: "File size too large (Max 5MB)."
      },
      room_modal: {
        create_title: "Create New Room",
        room_name: "Room Name",
        room_name_placeholder: "Dragon Lance",
        password: "Password (Optional)",
        password_placeholder: "Leave empty for approval-based entry",
        password_hint: "If you set a password, anyone with the password can join. If empty, you must approve each request.",
        create_btn: "Create",
        join_title: "Join Room",
        room_id: "Room ID",
        room_id_placeholder: "Enter room code",
        password_if_any: "Password (If any)",
        role_select: "Select Role",
        role_player: "Player",
        role_spectator: "Spectator",
        role_dm: "DM (Dungeon Master)",
        join_btn: "Join / Send Request",
        error_not_found: "Room not found.",
        error_wrong_password: "Incorrect password.",
        error_already_requested: "Request already sent.",
        success_request: "Join request sent. You can enter once the owner approves."
      },
      error_page: {
        title: "An Error Occurred!",
        default_msg: "We encountered an unexpected error.",
        back_home: "Return to Home"
      }
    }
  },
  de: {
    translation: {
      common: {
        save: "Speichern",
        cancel: "Abbrechen",
        delete: "Löschen",
        edit: "Bearbeiten",
        loading: "Laden...",
        error: "Fehler",
        success: "Erfolg",
        back: "Zurück"
      },
      auth: {
        title: "Dungeon Master",
        subtitle: "Verwalte Abenteuer, würfle und schreibe deine Legende.",
        google_signin: "Mit Google anmelden",
        terms: "Durch die Anmeldung akzeptieren Sie die Nutzungsbedingungen.",
        unauthorized_domain: "Diese Domain ist in der Firebase-Konsole nicht autorisiert.",
        popup_closed: "Anmeldefenster wurde geschlossen.",
        login_error_prefix: "Ein Fehler ist bei der Anmeldung aufgetreten: "
      },
      sidebar: {
        home: "Startseite",
        chat: "Chat",
        profile: "Mein Profil",
        logout: "Abmelden",
        add_room: "Raum hinzufügen"
      },
      dashboard: {
        lobby: "Lobby",
        hub: "Spiele-Hub",
        lobby_desc: "Starte ein neues Abenteuer oder tritt einem bestehenden bei.",
        hub_desc: "Entdecke alle öffentlichen Spiele.",
        my_lobby: "Zurück zur Lobby",
        all_games: "Alle Spiele",
        join_code: "Mit Code beitreten",
        new_room: "Neuer Raum",
        search_room: "Raumnamen suchen...",
        no_rooms: "Keine Räume gefunden.",
        friend_requests: "Freundschaftsanfragen",
        friends: "Freunde",
        invites: "Ausstehende Einladungen",
        no_requests: "Keine ausstehenden Anfragen.",
        no_friends: "Noch keine Freunde hinzugefügt.",
        no_invites: "Keine ausstehenden Einladungen.",
        invited_by: "Eingeladen von:",
        accept: "Annehmen",
        reject: "Ablehnen",
        join: "Beitreten",
        players: "Spieler",
        online: "Online"
      },
      profile: {
        title: "Profil bearbeiten",
        upload_photo: "Foto hochladen",
        max_size: "Max 5MB (JPG, PNG, GIF)",
        username: "Benutzername",
        bio: "Bio",
        bio_placeholder: "Erzähl uns etwas über dich...",
        language: "Sprache / Language",
        upload_error: "Fehler beim Hochladen des Fotos.",
        size_error: "Dateigröße muss kleiner als 5MB sein."
      },
      chat: {
        room_chat: "Raum-Chat",
        friends_chat: "Freunde",
        add_friend_placeholder: "Freund E-Mail",
        no_friends_msg: "Keine Freunde.",
        placeholder: "Nachricht schreiben...",
        user_not_found: "Benutzer nicht gefunden.",
        self_add_error: "Du kannst dich nicht selbst hinzufügen.",
        already_friends: "Ihr seid bereits Freunde.",
        request_sent: "Freundschaftsanfrage gesendet!",
        upload_fail: "Hochladen fehlgeschlagen.",
        file_too_large: "Datei zu groß (Max 5MB)."
      },
      room_modal: {
        create_title: "Neuen Raum erstellen",
        room_name: "Raumname",
        room_name_placeholder: "Drachenlanze",
        password: "Passwort (Optional)",
        password_placeholder: "Leer lassen für Eintritt per Genehmigung",
        password_hint: "Wenn Sie ein Passwort festlegen, kann jeder mit dem Passwort beitreten. Wenn leer, müssen Sie jede Anfrage genehmigen.",
        create_btn: "Erstellen",
        join_title: "Raum beitreten",
        room_id: "Raum-ID",
        room_id_placeholder: "Raumcode eingeben",
        password_if_any: "Passwort (falls vorhanden)",
        role_select: "Rolle wählen",
        role_player: "Spieler",
        role_spectator: "Zuschauer",
        role_dm: "DM (Spielleiter)",
        join_btn: "Beitreten / Anfrage senden",
        error_not_found: "Raum nicht gefunden.",
        error_wrong_password: "Falsches Passwort.",
        error_already_requested: "Anfrage bereits gesendet.",
        success_request: "Beitrittsanfrage gesendet. Du kannst eintreten, sobald der Besitzer zustimmt."
      },
      error_page: {
        title: "Ein Fehler ist aufgetreten!",
        default_msg: "Wir sind auf einen unerwarteten Fehler gestoßen.",
        back_home: "Zur Startseite"
      }
    }
  },
  fr: {
    translation: {
      common: {
        save: "Enregistrer",
        cancel: "Annuler",
        delete: "Supprimer",
        edit: "Modifier",
        loading: "Chargement...",
        error: "Erreur",
        success: "Succès",
        back: "Retour"
      },
      auth: {
        title: "Maître du Donjon",
        subtitle: "Gérez vos aventures, lancez les dés et écrivez votre légende.",
        google_signin: "Se connecter avec Google",
        terms: "En vous connectant, vous acceptez les conditions d'utilisation.",
        unauthorized_domain: "Ce domaine n'est pas autorisé dans la console Firebase.",
        popup_closed: "La fenêtre de connexion a été fermée.",
        login_error_prefix: "Une erreur est survenue lors de la connexion : "
      },
      sidebar: {
        home: "Accueil",
        chat: "Chat",
        profile: "Mon Profil",
        logout: "Déconnexion",
        add_room: "Ajouter une salle"
      },
      dashboard: {
        lobby: "Lobby",
        hub: "Hub de Jeux",
        lobby_desc: "Commencez une nouvelle aventure ou rejoignez-en une existante.",
        hub_desc: "Découvrez tous les jeux publics.",
        my_lobby: "Retour au Lobby",
        all_games: "Tous les jeux",
        join_code: "Rejoindre avec un code",
        new_room: "Nouvelle Salle",
        search_room: "Rechercher une salle...",
        no_rooms: "Aucune salle trouvée.",
        friend_requests: "Demandes d'amis",
        friends: "Amis",
        invites: "Invitations en attente",
        no_requests: "Aucune demande en attente.",
        no_friends: "Aucun ami ajouté pour le moment.",
        no_invites: "Aucune invitation en attente.",
        invited_by: "Invité par :",
        accept: "Accepter",
        reject: "Refuser",
        join: "Rejoindre",
        players: "Joueurs",
        online: "En ligne"
      },
      profile: {
        title: "Modifier le profil",
        upload_photo: "Télécharger une photo",
        max_size: "Max 5MB (JPG, PNG, GIF)",
        username: "Nom d'utilisateur",
        bio: "Bio",
        bio_placeholder: "Parlez-nous de vous...",
        language: "Langue / Language",
        upload_error: "Erreur lors du téléchargement de la photo.",
        size_error: "La taille du fichier doit être inférieure à 5 Mo."
      },
      chat: {
        room_chat: "Chat de Salle",
        friends_chat: "Amis",
        add_friend_placeholder: "Email de l'ami",
        no_friends_msg: "Pas d'amis.",
        placeholder: "Écrivez un message...",
        user_not_found: "Utilisateur non trouvé.",
        self_add_error: "Vous ne pouvez pas vous ajouter vous-même.",
        already_friends: "Vous êtes déjà amis.",
        request_sent: "Demande d'ami envoyée !",
        upload_fail: "Échec du téléchargement.",
        file_too_large: "Fichier trop volumineux (Max 5 Mo)."
      },
      room_modal: {
        create_title: "Créer une nouvelle salle",
        room_name: "Nom de la salle",
        room_name_placeholder: "Dragon Lance",
        password: "Mot de passe (Optionnel)",
        password_placeholder: "Laisser vide pour entrée par approbation",
        password_hint: "Si vous définissez un mot de passe, toute personne disposant du mot de passe peut rejoindre. Si vide, vous devez approuver chaque demande.",
        create_btn: "Créer",
        join_title: "Rejoindre une salle",
        room_id: "ID de salle",
        room_id_placeholder: "Entrez le code de la salle",
        password_if_any: "Mot de passe (si présent)",
        role_select: "Sélectionner un rôle",
        role_player: "Joueur",
        role_spectator: "Spectateur",
        role_dm: "MD (Maître du Donjon)",
        join_btn: "Rejoindre / Envoyer une demande",
        error_not_found: "Salle non trouvée.",
        error_wrong_password: "Mot de passe incorrect.",
        error_already_requested: "Demande déjà envoyée.",
        success_request: "Demande de participation envoyée. Vous pourrez entrer une fois que le propriétaire aura approuvé."
      },
      error_page: {
        title: "Une erreur est survenue !",
        default_msg: "Nous avons rencontré une erreur inattendue.",
        back_home: "Retour à l'accueil"
      }
    }
  },
  es: {
    translation: {
      common: {
        save: "Guardar",
        cancel: "Cancelar",
        delete: "Eliminar",
        edit: "Editar",
        loading: "Cargando...",
        error: "Error",
        success: "Éxito",
        back: "Atrás"
      },
      auth: {
        title: "Dungeon Master",
        subtitle: "Gestiona tus aventuras, tira los dados y escribe tu leyenda.",
        google_signin: "Iniciar sesión con Google",
        terms: "Al iniciar sesión, aceptas los términos de uso.",
        unauthorized_domain: "Este dominio no está autorizado en la consola de Firebase.",
        popup_closed: "La ventana de inicio de sesión se cerró.",
        login_error_prefix: "Ocurrió un error durante el inicio de sesión: "
      },
      sidebar: {
        home: "Inicio",
        chat: "Chat",
        profile: "Mi Perfil",
        logout: "Cerrar sesión",
        add_room: "Añadir Sala"
      },
      dashboard: {
        lobby: "Lobby",
        hub: "Centro de Juegos",
        lobby_desc: "Comienza una nueva aventura o únete a una existente.",
        hub_desc: "Descubre todos los juegos públicos.",
        my_lobby: "Volver al Lobby",
        all_games: "Todos los Juegos",
        join_code: "Unirse con Código",
        new_room: "Nueva Sala",
        search_room: "Buscar nombre de sala...",
        no_rooms: "No se encontraron salas.",
        friend_requests: "Solicitudes de Amistad",
        friends: "Amigos",
        invites: "Invitaciones Pendientes",
        no_requests: "No hay solicitudes pendientes.",
        no_friends: "Aún no has añadido amigos.",
        no_invites: "No hay invitaciones pendientes.",
        invited_by: "Invitado por:",
        accept: "Aceptar",
        reject: "Rechazar",
        join: "Unirse",
        players: "Jugadores",
        online: "En línea"
      },
      profile: {
        title: "Editar Perfil",
        upload_photo: "Subir Foto",
        max_size: "Máx 5MB (JPG, PNG, GIF)",
        username: "Nombre de usuario",
        bio: "Biografía",
        bio_placeholder: "Cuéntanos sobre ti...",
        language: "Idioma / Language",
        upload_error: "Error al subir la foto.",
        size_error: "El tamaño del archivo debe ser menor a 5MB."
      },
      chat: {
        room_chat: "Chat de Sala",
        friends_chat: "Amigos",
        add_friend_placeholder: "Correo de amigo",
        no_friends_msg: "No tienes amigos.",
        placeholder: "Escribe un mensaje...",
        user_not_found: "Usuario no encontrado.",
        self_add_error: "No puedes añadirte a ti mismo.",
        already_friends: "Ya sois amigos.",
        request_sent: "¡Solicitud de amistad enviada!",
        upload_fail: "Error al subir.",
        file_too_large: "Archivo demasiado grande (Máx 5MB)."
      },
      room_modal: {
        create_title: "Crear Nueva Sala",
        room_name: "Nombre de la Sala",
        room_name_placeholder: "Dragon Lance",
        password: "Contraseña (Opcional)",
        password_placeholder: "Dejar vacío para entrada con aprobación",
        password_hint: "Si estableces una contraseña, cualquiera con la contraseña puede unirse. Si está vacío, debes aprobar cada solicitud.",
        create_btn: "Crear",
        join_title: "Unirse a Sala",
        room_id: "ID de Sala",
        room_id_placeholder: "Introduce el código de sala",
        password_if_any: "Contraseña (si hay)",
        role_select: "Seleccionar Rol",
        role_player: "Jugador",
        role_spectator: "Espectador",
        role_dm: "DM (Dungeon Master)",
        join_btn: "Unirse / Enviar Solicitud",
        error_not_found: "Sala no encontrada.",
        error_wrong_password: "Contraseña incorrecta.",
        error_already_requested: "Solicitud ya enviada.",
        success_request: "Solicitud de unión enviada. Podrás entrar una vez que el propietario apruebe."
      },
      error_page: {
        title: "¡Ocurrió un Error!",
        default_msg: "Encontramos un error inesperado.",
        back_home: "Volver al Inicio"
      }
    }
  },
  it: {
    translation: {
      common: {
        save: "Salva",
        cancel: "Annulla",
        delete: "Elimina",
        edit: "Modifica",
        loading: "Caricamento...",
        error: "Errore",
        success: "Successo",
        back: "Indietro"
      },
      auth: {
        title: "Dungeon Master",
        subtitle: "Gestisci le tue avventure, lancia i dadi e scrivi la tua leggenda.",
        google_signin: "Accedi con Google",
        terms: "Accedendo, accetti i termini di utilizzo.",
        unauthorized_domain: "Questo dominio non è autorizzato nella console Firebase.",
        popup_closed: "La finestra di accesso è stata chiusa.",
        login_error_prefix: "Si è verificato un errore durante l'accesso: "
      },
      sidebar: {
        home: "Home",
        chat: "Chat",
        profile: "Il Mio Profilo",
        logout: "Esci",
        add_room: "Aggiungi Stanza"
      },
      dashboard: {
        lobby: "Lobby",
        hub: "Hub di Gioco",
        lobby_desc: "Inizia una nuova avventura o unisciti a una esistente.",
        hub_desc: "Scopri tutti i giochi pubblici.",
        my_lobby: "Torna alla Lobby",
        all_games: "Tutti i Giochi",
        join_code: "Unisciti con Codice",
        new_room: "Nuova Stanza",
        search_room: "Cerca nome stanza...",
        no_rooms: "Nessuna stanza trovata.",
        friend_requests: "Richieste di Amicizia",
        friends: "Amici",
        invites: "Inviti in Sospeso",
        no_requests: "Nessuna richiesta in sospeso.",
        no_friends: "Nessun amico aggiunto ancora.",
        no_invites: "Nessun invito in sospeso.",
        invited_by: "Invitato da:",
        accept: "Accetta",
        reject: "Rifiuta",
        join: "Unisciti",
        players: "Giocatori",
        online: "Online"
      },
      profile: {
        title: "Modifica Profilo",
        upload_photo: "Carica Foto",
        max_size: "Max 5MB (JPG, PNG, GIF)",
        username: "Nome Utente",
        bio: "Bio",
        bio_placeholder: "Raccontaci di te...",
        language: "Lingua / Language",
        upload_error: "Errore durante il caricamento della foto.",
        size_error: "La dimensione del file deve essere inferiore a 5MB."
      },
      chat: {
        room_chat: "Chat Stanza",
        friends_chat: "Amici",
        add_friend_placeholder: "Email Amico",
        no_friends_msg: "Nessun amico.",
        placeholder: "Scrivi un messaggio...",
        user_not_found: "Utente non trovato.",
        self_add_error: "Non puoi aggiungere te stesso.",
        already_friends: "Siete già amici.",
        request_sent: "Richiesta di amicizia inviata!",
        upload_fail: "Caricamento fallito.",
        file_too_large: "File troppo grande (Max 5MB)."
      },
      room_modal: {
        create_title: "Crea Nuova Stanza",
        room_name: "Nome Stanza",
        room_name_placeholder: "Dragon Lance",
        password: "Password (Opzionale)",
        password_placeholder: "Lascia vuoto per ingresso con approvazione",
        password_hint: "Se imposti una password, chiunque abbia la password può entrare. Se vuoto, devi approvare ogni richiesta.",
        create_btn: "Crea",
        join_title: "Unisciti alla Stanza",
        room_id: "ID Stanza",
        room_id_placeholder: "Inserisci codice stanza",
        password_if_any: "Password (se presente)",
        role_select: "Seleziona Ruolo",
        role_player: "Giocatore",
        role_spectator: "Spettatore",
        role_dm: "DM (Dungeon Master)",
        join_btn: "Unisciti / Invia Richiesta",
        error_not_found: "Stanza non trovata.",
        error_wrong_password: "Password errata.",
        error_already_requested: "Richiesta già inviata.",
        success_request: "Richiesta di partecipazione inviata. Potrai entrare una volta che il proprietario avrà approvato."
      },
      error_page: {
        title: "Si è verificato un errore!",
        default_msg: "Abbiamo riscontrato un errore imprevisto.",
        back_home: "Torna alla Home"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'tr', // Default language
    interpolation: {
      escapeValue: false // React already safes from xss
    }
  });

export default i18n;
