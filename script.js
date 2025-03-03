document.addEventListener("DOMContentLoaded", () => {
    const chatMessages = document.getElementById("chat-messages");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;
    const welcomeSection = document.querySelector(".welcome-section");
    const chatInputContainer = document.querySelector(".chat-input-container");

    // API Key de OpenAI - DEBES REEMPLAZAR ESTO con tu propia clave
    const OPENAI_API_KEY = "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";

    // Ajustar el tamaño inicial del contenedor de mensajes
    function adjustMessagesContainer() {
        const headerHeight = document.querySelector(".chat-header").offsetHeight;
        const inputHeight = chatInputContainer.offsetHeight;
        chatMessages.style.height = `calc(100vh - ${headerHeight + inputHeight}px)`;
        chatMessages.style.marginBottom = '0';
        scrollToBottom();
    }

    // Llamar al ajuste inicial y cuando la ventana cambie de tamaño
    adjustMessagesContainer();
    window.addEventListener('resize', adjustMessagesContainer);

    // Setup event delegation for quick reply buttons
    chatMessages.addEventListener('click', (e) => {
        if (e.target.classList.contains('quick-reply-btn')) {
            const replyText = e.target.textContent;
            addMessage(replyText, "user");

            // Remove all quick replies after selection
            const quickReplies = document.querySelectorAll('.quick-replies');
            quickReplies.forEach(qr => {
                qr.remove();
            });

            // Llamar a la API de OpenAI o usar respuesta predefinida como fallback
            getOpenAIResponse(replyText)
                .then(response => {
                    addMessage(response.text, "assistant", response.quickReplies);
                    adjustMessagesContainer();
                })
                .catch(error => {
                    console.error("Error con OpenAI:", error);
                    simulateResponse();
                });
        }
    });

    // Auto-resize textarea as user types
    userInput.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = this.scrollHeight + "px";
        if (this.scrollHeight > 150) {
            this.style.overflowY = "auto";
        } else {
            this.style.overflowY = "hidden";
        }
        adjustMessagesContainer();
    });

    // Send message when Enter key is pressed (without Shift)
    userInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Send message when send button is clicked
    sendButton.addEventListener("click", sendMessage);

    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            // Hide welcome section if it's the first message
            if (welcomeSection && welcomeSection.style.display !== "none") {
                welcomeSection.style.display = "none";
            }

            // Add user message to chat
            addMessage(message, "user");

            // Clear input
            userInput.value = "";
            userInput.style.height = "auto";
            adjustMessagesContainer();

            // Mostrar indicador de escritura
            showTypingIndicator();

            // Intentar obtener respuesta de OpenAI
            getOpenAIResponse(message)
                .then(response => {
                    // Eliminar indicador de escritura
                    removeTypingIndicator();

                    // Mostrar respuesta
                    addMessage(response.text, "assistant", response.quickReplies);
                    adjustMessagesContainer();
                })
                .catch(error => {
                    console.error("Error con OpenAI:", error);
                    removeTypingIndicator();
                    simulateResponse();
                });
        }
    }

    // Función para mostrar indicador de escritura
    function showTypingIndicator() {
        const typingIndicator = document.createElement("div");
        typingIndicator.className = "message assistant typing-indicator";
        typingIndicator.id = "typing-indicator";
        typingIndicator.style.opacity = "0";
        typingIndicator.style.transform = "translateY(20px)";

        typingIndicator.innerHTML = `
            <div class="message-avatar">
                <div class="avatar-icon">
                    <i class="fas fa-graduation-cap"></i>
                </div>
            </div>
            <div class="message-content">
                <div class="message-sender">EduGuide</div>
                <div class="message-text typing">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
            </div>
        `;

        chatMessages.appendChild(typingIndicator);
        scrollToBottom();

        // Animación de entrada
        setTimeout(() => {
            typingIndicator.style.transition = "opacity 0.3s, transform 0.3s";
            typingIndicator.style.opacity = "1";
            typingIndicator.style.transform = "translateY(0)";
            scrollToBottom();
        }, 10);
    }

    // Función para eliminar indicador de escritura
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById("typing-indicator");
        if (typingIndicator) {
            chatMessages.removeChild(typingIndicator);
        }
    }

    // Función para obtener respuesta de OpenAI
    async function getOpenAIResponse(userMessage, category = "") {
        // Construir prompt contextualizado para educación
        const systemPrompt = `Eres EduGuide, un asistente educativo especializado en ${category || "educación general"}.
        Tus respuestas deben ser útiles, informativas y adaptadas para estudiantes.
        NO uses acentos, tildes ni caracteres especiales como ñ en tus respuestas.
        Proporciona respuestas concisas pero completas.
        Si no sabes algo con certeza, aclárale al usuario que esa información puede no ser precisa.`;

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userMessage }
                    ],
                    max_tokens: 300,
                    temperature: 0.7
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            // Obtener la respuesta generada
            const aiText = data.choices[0].message.content;

            // Generar botones de respuesta rápida relevantes al contexto
            const quickReplies = generateQuickRepliesFromText(aiText, category);

            return {
                text: aiText,
                quickReplies: quickReplies
            };
        } catch (error) {
            console.error("Error con OpenAI:", error);
            throw error;
        }
    }

    // Generar botones de respuesta rápida a partir del texto
    function generateQuickRepliesFromText(text, category) {
        // Si tenemos botones predefinidos para esta categoría, úsalos
        const categoryReplies = {
            "admisiones": ["Requisitos de documentos", "Fechas limite", "Proceso de entrevista", "Universidades publicas"],
            "becas": ["Becas academicas", "Becas deportivas", "Becas internacionales", "Como aplicar"],
            "carreras": ["Carreras tecnologicas", "Ciencias de la salud", "Humanidades", "Test vocacional"],
            "estudiar": ["Metodo Pomodoro", "Mapas mentales", "Tecnicas de memorización", "Organizar horarios"]
        };

        if (category && categoryReplies[category]) {
            return categoryReplies[category];
        }

        // Intentar extraer sugerencias del texto
        let suggestions = [];

        // Buscar frases que parezcan preguntas o sugerencias
        const questionMatches = text.match(/(?:¿|quieres|te gustaria|podrias|sobre)([^?,.!]+)/gi);
        if (questionMatches && questionMatches.length > 0) {
            questionMatches.slice(0, 2).forEach(match => {
                const cleanedMatch = match.replace(/¿|quieres|te gustaria|podrias|sobre/gi, '').trim();
                if (cleanedMatch.length > 3 && cleanedMatch.length < 30) {
                    suggestions.push(cleanedMatch);
                }
            });
        }

        // Si no encontramos suficientes sugerencias, usar opciones genéricas
        if (suggestions.length < 3) {
            suggestions = suggestions.concat([
                "Mas informacion",
                "Dame ejemplos",
                "Becas disponibles",
                "Orientacion vocacional"
            ]);
        }

        // Limitar a 4 sugerencias
        return suggestions.slice(0, 4);
    }

    // Simulación de respuesta local (fallback si falla OpenAI)
    function simulateResponse(category = "") {
        let responses, quickReplies;
        if (category === "admisiones") {
            responses = [
                "Para el proceso de admision, necesitaras los siguientes documentos: transcripcion de notas, identificacion valida y resultados de examenes estandarizados. Quieres que te explique mas sobre alguno de estos requisitos?",
                "Las fechas limite de admision varian segun la institucion y el programa. Generalmente, para el semestre de otono, debes aplicar entre noviembre y enero del ano anterior. Te gustaria que busquemos fechas especificas para alguna universidad en particular?",
            ];
            quickReplies = ["Requisitos de documentos", "Fechas limite", "Proceso de entrevista", "Universidades publicas"];
        } else if (category === "becas") {
            responses = [
                "Existen varios tipos de becas: por merito academico, necesidad financiera, deportivas y de diversidad. Sobre cual te gustaria mas informacion?",
                "Para aumentar tus posibilidades de obtener una beca, asegurate de mantener buenas calificaciones, participar en actividades extracurriculares y cumplir con todos los requisitos de la aplicacion. Quieres que profundicemos en alguna de estas estrategias?",
            ];
            quickReplies = ["Becas academicas", "Becas deportivas", "Becas internacionales", "Como aplicar"];
        } else if (category === "carreras") {
            responses = [
                "Al elegir una carrera, considera tus intereses, habilidades y las perspectivas laborales futuras. Te gustaria que exploremos algunas opciones basadas en tus intereses?",
                "Algunas de las carreras con mayor demanda actualmente incluyen Ingenieria de Software, Ciencia de Datos y Enfermeria. Quieres que te cuente mas sobre alguna de estas u otras carreras?",
            ];
            quickReplies = ["Carreras tecnologicas", "Ciencias de la salud", "Humanidades", "Test vocacional"];
        } else if (category === "estudiar") {
            responses = [
                "Una tecnica efectiva de estudio es el metodo Pomodoro: estudia durante 25 minutos y luego toma un descanso de 5 minutos. Te gustaria conocer mas tecnicas de gestion del tiempo?",
                "Para mejorar la retencion, intenta explicar el material a alguien mas o crear mapas mentales. Quieres que te explique como crear un mapa mental efectivo?",
            ];
            quickReplies = ["Metodo Pomodoro", "Mapas mentales", "Tecnicas de memorización", "Organizar horarios"];
        } else {
            // Respuestas generales
            responses = [
                "Gracias por tu pregunta. Para ayudarte mejor, podrias darme mas detalles sobre tu situacion educativa actual?",
                "Excelente pregunta. Basado en lo que me comentas, te recomendaria explorar estas opciones: <ul><li>Opcion 1: Programas de licenciatura en universidades publicas</li><li>Opcion 2: Cursos tecnicos especializados</li><li>Opcion 3: Programas de educacion en linea acreditados</li></ul>",
                "Entiendo tu situacion. Para avanzar en ese camino educativo, estos son los pasos que deberias seguir: <ol><li>Investigar los requisitos de admision</li><li>Preparar tu documentacion</li><li>Considerar opciones de financiamiento</li></ol>",
                "Claro que puedo ayudarte con eso! Te gustaria que te explique mas sobre los requisitos especificos o las oportunidades de becas disponibles?",
            ];
            quickReplies = ["Opciones educativas", "Admisiones", "Becas disponibles", "Orientacion vocacional"];
        }

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        removeTypingIndicator();
        addMessage(randomResponse, "assistant", quickReplies);
        adjustMessagesContainer();
    }

    function addMessage(text, sender, quickReplies = []) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${sender}`;
        messageDiv.style.opacity = "0";
        messageDiv.style.transform = "translateY(20px)";

        // Asegurarse de que el texto se renderiza correctamente
        const encodedText = text;

        if (sender === "user") {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${encodedText}</div>
                </div>
                <div class="message-avatar">
                    <div class="avatar-icon user-icon">
                        <i class="fas fa-user"></i>
                    </div>
                </div>
            `;

            chatMessages.appendChild(messageDiv);
            scrollToBottom();

            // Animación de entrada
            setTimeout(() => {
                messageDiv.style.transition = "opacity 0.3s, transform 0.3s";
                messageDiv.style.opacity = "1";
                messageDiv.style.transform = "translateY(0)";
                scrollToBottom();
            }, 10);
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <div class="avatar-icon">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                </div>
                <div class="message-content">
                    <div class="message-sender">EduGuide</div>
                    <div class="message-text">${encodedText}</div>
                    ${quickReplies && quickReplies.length > 0 ?
                    `<div class="quick-replies">
                        ${quickReplies.map(reply =>
                        `<button class="quick-reply-btn">${reply}</button>`
                    ).join('')}
                    </div>` : ''}
                </div>
            `;

            chatMessages.appendChild(messageDiv);
            scrollToBottom();

            // Animación de entrada
            setTimeout(() => {
                messageDiv.style.transition = "opacity 0.3s, transform 0.3s";
                messageDiv.style.opacity = "1";
                messageDiv.style.transform = "translateY(0)";
                scrollToBottom();
            }, 10);
        }
    }

    function scrollToBottom() {
        // Asegurar que el scroll sea al final completo del chat
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight + 1000;
        }, 10);
    }

    // Chat history functionality
    const chatList = document.getElementById("chat-list");
    const chatListItems = chatList.getElementsByTagName("li");

    for (const item of chatListItems) {
        item.addEventListener("click", function () {
            // Remove 'active' class from all items
            for (const i of chatListItems) {
                i.classList.remove("active");
            }
            // Add 'active' class to clicked item
            this.classList.add("active");

            // Simular la carga del chat seleccionado
            const chatTitle = this.textContent;
            chatMessages.innerHTML = ""; // Limpiar el chat actual

            if (chatTitle === "Chat Actual") {
                // Mostrar la sección de bienvenida para el Chat Actual
                welcomeSection.style.display = "flex";
            } else {
                // Ocultar la sección de bienvenida para otros chats
                welcomeSection.style.display = "none";

                // Añadir un mensaje de bienvenida para el chat seleccionado
                addMessage(
                    `Has seleccionado el chat: ${chatTitle}. En que puedo ayudarte con respecto a este tema?`,
                    "assistant",
                    ["Mas informacion", "Ver opciones", "Empezar consulta"]
                );

                setTimeout(() => {
                    if (chatTitle === "Consulta sobre Ingeniería") {
                        addMessage("Me gustaria saber mas sobre las diferentes ramas de la ingenieria.", "user");
                        showTypingIndicator();
                        setTimeout(() => {
                            removeTypingIndicator();
                            addMessage(
                                "Las principales ramas de la ingenieria incluyen: Ingenieria Civil (construccion de estructuras e infraestructuras), Ingenieria Mecanica (diseño y fabricacion de maquinas), Ingenieria Electrica (sistemas electricos y electronicos), Ingenieria Quimica (procesos y materiales) e Ingenieria de Software (desarrollo de programas informaticos). Cada una tiene diferentes enfoques y oportunidades laborales. Cual te interesa explorar mas?",
                                "assistant",
                                ["Ingenieria Civil", "Ingenieria Mecanica", "Ingenieria Electrica", "Ingenieria de Software"]
                            );
                        }, 2000);
                    } else if (chatTitle === "Opciones de Becas") {
                        addMessage("Que tipos de becas estan disponibles para estudiantes internacionales?", "user");
                        showTypingIndicator();
                        setTimeout(() => {
                            removeTypingIndicator();
                            addMessage(
                                "Para estudiantes internacionales existen varios tipos de becas: 1) Becas por merito academico basadas en calificaciones y logros, 2) Becas especificas por pais que ofrecen acuerdos entre gobiernos, 3) Becas de investigacion para programas de posgrado, y 4) Ayuda financiera basada en necesidades economicas. Muchas universidades tambien tienen programas propios para atraer talento internacional. Que aspecto te interesa conocer con mas detalle?",
                                "assistant",
                                ["Becas academicas", "Becas por pais", "Becas de investigacion", "Ayuda financiera"]
                            );
                        }, 2000);
                    } else if (chatTitle === "Orientación Vocacional") {
                        addMessage("No estoy seguro de que carrera elegir. Como puedo decidir?", "user");
                        showTypingIndicator();
                        setTimeout(() => {
                            removeTypingIndicator();
                            addMessage(
                                "Elegir carrera es una decision importante. Te recomiendo seguir estos pasos: 1) Identifica tus intereses y pasiones, 2) Evalua tus habilidades y fortalezas, 3) Investiga las perspectivas laborales de diferentes campos, 4) Considera hacer tests vocacionales para obtener sugerencias basadas en tu perfil, y 5) Habla con profesionales en areas que te interesen. Podemos empezar explorando tus materias favoritas o actividades que disfrutas hacer. Que te gustaria explorar primero?",
                                "assistant",
                                ["Explorar intereses", "Test vocacional", "Carreras con demanda", "Habilidades personales"]
                            );
                        }, 2000);
                    }

                    adjustMessagesContainer();
                }, 1000);
            }
        });
    }

    themeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-theme");
        const isDarkTheme = body.classList.contains("dark-theme");
        themeToggle.innerHTML = isDarkTheme ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    const categoryButtons = document.querySelectorAll(".category-btn");
    categoryButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const category = button.dataset.category;
            // Ocultar la sección de bienvenida
            welcomeSection.style.display = "none";
            addMessage(`Has seleccionado la categoria: ${category}. Que te gustaria saber sobre ${category}?`, "assistant");

            // Usar OpenAI si está disponible, sino usar respuestas predefinidas
            showTypingIndicator();
            getOpenAIResponse(`Dame información general sobre ${category} en educación`, category)
                .then(response => {
                    removeTypingIndicator();
                    addMessage(response.text, "assistant", response.quickReplies);
                    adjustMessagesContainer();
                })
                .catch(error => {
                    console.error("Error con OpenAI:", error);
                    simulateResponse(category);
                });
        });
    });
});