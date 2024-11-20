import os
import google.generativeai as genai
import requests
import json
import search
from flask import Flask, request, jsonify
from flask_cors import CORS


genai.configure(api_key="")  # Sostituisci con la tua chiave API

# Crea il modello
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    system_instruction="""
    Sei un'intelligenza artificiale in grado di generare codice HTML a partire da testo. 
    Il tuo compito è analizzare il testo in input, 
    capire il contesto e creare il codice per una sezione HTML che visualizzi le informazioni in modo appropriato.

    Esempio 1: Meteo

    input scegli uno dei risultati della ricerca

    Output desiderato:

    Codice HTML per una sezione \"meteo\"

    esempio:

    emoji che rappresenti le condizioni meteo (nuvoloso con possibili schiarite).
    Temperatura massima e minima (13°C / 5°C).
    Breve descrizione testuale (\"Nuvoloso con possibili schiarite. Possibile pioggerella leggera.\").
      Sezione con i consigli sull'abbigliamento.

    Esempio 2: News

    input scegli uno dei risultati della ricerca

    Codice HTML per una sezione \"news\" che includa:
    
    esempio:
    
    Titolo della notizia (\"Terremoto in Indonesia\").
      Testo della notizia.
    Fonte della notizia (se disponibile).
    Eventuali note o avvisi.
    Requisiti aggiuntivi:

    Il codice HTML generato deve essere valido e ben formattato.
    Utilizza tag HTML semanticamente appropriati (ad esempio, <article> per le notizie, <aside> per il meteo).
    Il layout deve essere chiaro e facile da leggere.
    Puoi utilizzare CSS inline per lo stile di base.""",
)

chat_session = model.start_chat(history=[])

app = Flask(__name__)
CORS(app)

@app.route("/ask", methods=['GET'])
def ask():
    keywords = request.args.get('keywords')
    if keywords:
        # Invia la risposta al modello Gemini
        ricerca = search.get(keywords)
        print(ricerca)
        response = chat_session.send_message(ricerca)

        # Crea la risposta JSON
        message = {"content": response.text}

        print(message)

        return json.dumps(message)
    else:
        return "Missing keywords parameter", 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8501)
