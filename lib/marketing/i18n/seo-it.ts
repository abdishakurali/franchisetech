import type { SeoRoOverrides } from "./types";

/** Italian copy for SEO pages — merged over English at render time. */
export const seoItOverrides: Record<string, SeoRoOverrides> = {
  pos: {
    eyebrow: "Cassa POS",
    title: "POS semplice per bar e attività food",
    metaTitle: "POS semplice per bar e piccole attività food",
    description: "Vendite, apertura e chiusura cassa, contanti/carta, scontrini e registri giornalieri in franchisetech.",
    h1: "Cassa POS semplice, pensata per piccole attività food",
    intro:
      "franchisetech mantiene la cassa pratica: prodotti, clienti, pagamenti contanti/carta, scontrini, resi e chiusure giornaliere in un unico posto.",
    bullets: [
      "Griglia prodotti veloce e carrello",
      "Sessioni apertura e chiusura cassa",
      "Tracciamento contanti, carta e altri pagamenti",
      "Clienti, scontrini, transazioni, resi e annullamenti",
    ],
    sections: [
      {
        title: "Cassa senza confusione",
        body: "Lo staff aggiunge prodotti, sceglie il metodo di pagamento, associa il cliente e completa la vendita senza schermate complicate.",
      },
      {
        title: "Ogni vendita resta tracciabile",
        body: "Transazioni, resi, motivi annullamento, scontrini e movimenti contanti sono registrati per la revisione dopo il servizio.",
      },
      {
        title: "Chiudi la giornata con fiducia",
        body: "Contanti apertura, vendite contanti/carta, entrate/uscite contanti, contanti attesi, contati e differenza — tutto per la riconciliazione giornaliera.",
      },
    ],
    faqs: [
      {
        question: "franchisetech è un terminale di pagamento?",
        answer: "No. franchisetech registra le vendite POS e il metodo di pagamento. L'integrazione hardware pagamenti è pianificata, ma non va data per scontata oggi.",
      },
      {
        question: "Posso tracciare resi e annullamenti?",
        answer: "Sì. Resi e annullamenti sono conservati con motivo, così il registro cassa resta chiaro.",
      },
      {
        question: "Posso usarlo su tablet in cassa?",
        answer: "Sì. franchisetech funziona nel browser — laptop, tablet o schermo cassa.",
      },
      {
        question: "Quanti dipendenti possono usare la cassa?",
        answer: "Illimitati. Aggiungete cassieri, manager e ruoli cucina senza costo per utente.",
      },
    ],
  },
  "kitchen-display": {
    eyebrow: "Display cucina",
    title: "Display cucina per ordini pagati",
    metaTitle: "Display cucina (KDS) per bar e ristoranti",
    description: "Ordini pagati su un board da nuovo a pronto — meno confusione in cucina e tempi di prep più chiari.",
    h1: "Display cucina che mostra cosa preparare adesso",
    intro:
      "Quando un ordine è pagato in cassa, appare sul display cucina. Il team vede cosa è nuovo, in preparazione e pronto — senza foglietti o urla.",
    bullets: [
      "Ordini pagati in tempo reale",
      "Stati nuovo → in prep → pronto",
      "Vista ottimizzata per schermo a parete",
      "Meno errori tra sala e cucina",
    ],
    sections: [
      {
        title: "Un solo flusso ordine",
        body: "Niente doppia digitazione: la vendita in cassa alimenta direttamente il board cucina.",
      },
      {
        title: "Priorità visiva chiara",
        body: "Il team vede subito cosa è in attesa e cosa è quasi pronto per il pass.",
      },
      {
        title: "Pensato per il servizio quotidiano",
        body: "Funziona nel browser su tablet o monitor — montate dove serve in cucina.",
      },
    ],
    faqs: [
      {
        question: "Serve hardware speciale?",
        answer: "No. Un tablet o monitor con browser è sufficiente per iniziare.",
      },
      {
        question: "Gli ordini appaiono solo dopo il pagamento?",
        answer: "Sì. Il display mostra ordini pagati così la cucina prepara ciò che è già incassato.",
      },
      {
        question: "Funziona con più postazioni cassa?",
        answer: "Sì. Tutte le vendite pagate confluiscono nello stesso board cucina.",
      },
    ],
  },
};
