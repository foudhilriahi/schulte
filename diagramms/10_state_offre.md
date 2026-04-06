# Diagramme d'Etats — Cycle de Vie d'une Offre d'Emploi
# OfferStatus : open paused closed

```mermaid
stateDiagram-v2
    direction LR

    [*] --> Creation : RH clique Nouvelle offre

    state Creation {
        [*] --> ChoixTemplate
        ChoixTemplate --> FormulairePreRempli : Choisit un template
        ChoixTemplate --> FormulaireVide : Creer depuis zero
        FormulairePreRempli --> Validation : Remplit contrat delai sieges
        FormulaireVide --> Validation : Remplit tous les champs
        note right of ChoixTemplate
            RH voit uniquement templates actifs
            Liste mise a jour en temps reel via template:updated
        end note
    }

    Validation --> Brouillon : Enregistre comme brouillon status paused
    Validation --> Ouverte : Publie immediatement status open

    state Ouverte {
        [*] --> Publiee
        note right of Publiee
            Socket.io offer:new broadcast
            Toutes les PWA recoivent l'offre sans rechargement
        end note
    }

    Brouillon --> Ouverte : RH change statut open
    Ouverte --> EnPause : RH met en pause status paused
    EnPause --> Ouverte : RH reouvre status open

    Ouverte --> Cloturee : RH cloture manuellement status closed
    Ouverte --> Cloturee : Deadline depassee via cron job

    state Cloturee {
        [*] --> Fermee
        note right of Fermee
            Socket.io offer:closed broadcast
            Offre disparait de la PWA candidat
            Aucune nouvelle candidature acceptee
        end note
    }

    Brouillon --> Supprimee : Soft delete deletedAt
    Ouverte --> Supprimee : Soft delete deletedAt
    EnPause --> Supprimee : Soft delete deletedAt
    Cloturee --> Supprimee : Soft delete deletedAt

    Cloturee --> [*]
    Supprimee --> [*]
```
