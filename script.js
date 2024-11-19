// Dichiara le variabili globali all'inizio del file
let searchBar;
let searchButton;
let newsSection;

// Aspetta che il DOM sia completamente caricato
window.addEventListener('DOMContentLoaded', () => {
    // Inizializza le variabili globali dopo che il DOM è caricato
    searchBar = document.getElementById('search-bar');
    searchButton = document.getElementById('search-button');
    newsSection = document.querySelector('section');
});

function loadContent(keywords, iframeId) {
  fetch(`http://localhost:8081/?keywords=${keywords}`)
    .then(response => response.json())
    .then(data => {
      const startIndex = data.content.indexOf("```html") + 7;
      const endIndex = data.content.lastIndexOf("```");

      const extractedText = data.content.substring(startIndex, endIndex).trim();
      
      // Ottieni il riferimento all'iframe
      const iframe = document.getElementById(iframeId); 

      // Crea il pulsante "X"
      const closeButton = document.createElement('button');
      closeButton.textContent = 'X';
      closeButton.style = "position: fixed; top: 10px; right: 10px; background-color: transparent; border: 0px;"; // Posizionamento assoluto

      closeButton.addEventListener('click', () => {
          // Rimuovi il frame dalla sezione
          newsSection.removeChild(iframe); // Usa la variabile iframe
          // Rimuovi il frame dalla memoria locale
          removeFromLocalStorage(iframeId);
      });

      // Attendi il caricamento dell'iframe
      iframe.addEventListener('load', () => { 
          // Ora puoi accedere al document dell'iframe
          iframe.contentWindow.document.body.appendChild(closeButton); 

          const style = document.createElement('style');
          
          style.textContent = `
            /* Stili per la barra di scorrimento */
            ::-webkit-scrollbar {
              width: 10px;
              height: 10px;
            }

            ::-webkit-scrollbar-track {
              background: #f1f1f1; 
            }

            ::-webkit-scrollbar-thumb {
              background: #888; 
              border-radius: 10px;
            }

            ::-webkit-scrollbar-thumb:hover  {
              background: #555; 
            }
          `;
          iframe.contentWindow.document.head.appendChild(style);
      });

      iframe.srcdoc = extractedText; // Imposta il contenuto dell'iframe DOPO aver aggiunto l'event listener

    })
    .catch(error => {
      console.error(`Errore nel caricamento di ${keywords}:`, error);
      // Gestisci l'errore, ad esempio mostrando un messaggio all'utente
      document.getElementById(iframeId).srcdoc = "Errore nel caricamento dei dati.";
    });
}


// Funzione per rimuovere un frame dalla memoria locale
function removeFromLocalStorage(frameId) {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    searchHistory = searchHistory.filter(item => item.frameId !== frameId);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

// Funzione per caricare i frame dalla memoria locale
function loadFramesFromHistory() {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

    searchHistory.forEach(item => {
        const newFrame = document.createElement('iframe');
        newFrame.classList.add('frame');
        newFrame.id = item.frameId;
        newFrame.srcdoc = getLoadingAnimation();
        
        newsSection.appendChild(newFrame);
        
        loadContent(item.query, item.frameId); 
    });
}

// Carica i frame all'avvio della pagina
window.addEventListener('DOMContentLoaded', loadFramesFromHistory);

function ricerca()  {

    const query = searchBar.value;

    // Conta gli iframe esistenti
    const existingFrames = newsSection.querySelectorAll('iframe').length;

    // Crea un nuovo iframe con id univoco
    const newFrame = document.createElement('iframe');
    newFrame.classList.add('frame');
    newFrame.id = `frame-${existingFrames + 1}`; // Assegna l'id
    newFrame.srcdoc = getLoadingAnimation();
    // Aggiungi il nuovo iframe alla sezione
    newsSection.appendChild(newFrame);

    loadContent(query, newFrame.id);
    saveQueryAndFrame(query, newFrame.id);
};


function saveQueryAndFrame(query, frameId) {
    // Ottieni i dati esistenti dalla memoria locale o crea un array vuoto
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    console.log(searchHistory);
    // Aggiungi la nuova query e l'id del frame all'array
    searchHistory.push({ query: query, frameId: frameId });

    // Salva l'array aggiornato nella memoria locale
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

function getLoadingAnimation() {
  const loadingTexts = [
    "Cercando le informazioni...",
    "Confrontando le varie fonti...",
    "Analizzando i dati...",
    "Generando la risposta...",
  ];

  return `
    <style>
    body {
      overflow: hidden
    }
    </style>
    <script src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs" type="module"></script>
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
      <dotlottie-player src="https://lottie.host/9ee46b02-06d9-4f3d-b58d-894706d76640/Ug2gQBGp1U.json" style="width:128px" background="transparent" speed="1" loop="" autoplay=""></dotlottie-player>
      <p style="font-size: 18px; margin-top: 20px; text-align: center;">${loadingTexts[0]}</p>
      <script>
        const loadingTexts = ${JSON.stringify(loadingTexts)};
        const loadingText = document.querySelector('p');
        let textIndex = 0;
        setInterval(() => {
          loadingText.textContent = loadingTexts[textIndex];
          textIndex = (textIndex + 1) % loadingTexts.length;
        }, 2000);
      </script>
    </div>
  `;
}