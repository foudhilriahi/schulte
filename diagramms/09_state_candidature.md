# Diagramme d'Etats — Cycle de Vie d'une Candidature
# ApplicationStatus : new reviewing interview accepted rejected

```mermaid
stateDiagram-v2
    direction TB

    [*] --> Nouvelle : Candidat soumet PDF ou formulaire

    state Nouvelle {
        [*] --> EnAttente
        note right of EnAttente
            Carte dans colonne Nouveau du Kanban RH
            Socket.io envoie application:new au RH
        end note
    }

    Nouvelle --> EnExamen : RH deplace la carte
    Nouvelle --> Refusee : RH rejette directement

    state EnExamen {
        [*] --> EnCours
        note right of EnCours
            Socket.io status:changed vers PWA candidat
            Notification creee en base
            Email envoye si email disponible
        end note
    }

    EnExamen --> EntretienPlanifie : RH deplace et remplit ScheduleModal
    EnExamen --> Refusee : RH rejette

    state EntretienPlanifie {
        [*] --> DateFixee
        note right of DateFixee
            POST /api/interviews cree
            Socket.io interview:scheduled vers candidat
            Email avec fichier ics calendrier
            Rappel J-1 automatique via node-cron
        end note
    }

    EntretienPlanifie --> Absente : RH marque No Show
    Absente --> EntretienPlanifie : Reprogrammation

    EntretienPlanifie --> Acceptee : outcome pass
    EntretienPlanifie --> Refusee : outcome fail

    state Acceptee {
        [*] --> Confetti
        Confetti --> BanniereVerte
        note right of BanniereVerte
            Felicitations votre candidature a ete retenue
        end note
    }

    state Refusee {
        [*] --> BanniereGrise
        note right of BanniereGrise
            Message bienveillant
            Merci de votre interet nous conservons votre profil
        end note
    }

    Acceptee --> [*]
    Refusee --> [*]
```
