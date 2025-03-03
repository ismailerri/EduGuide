# Documentación Técnica - EduGuide Ismail Errifaiy

## 1. Introducción

EduGuide es un asistente educativo virtual diseñado para proporcionar información y orientación a estudiantes sobre diversos temas académicos. Implementado como una aplicación web interactiva con interfaz de chat, EduGuide simula una conversación natural con un asesor educativo que responde consultas sobre admisiones universitarias, becas, carreras profesionales y técnicas de estudio.

Este proyecto integra una interfaz de usuario moderna e intuitiva con capacidades de inteligencia artificial para ofrecer respuestas contextuales y personalizadas, ayudando a los usuarios a navegar por el complejo mundo de las decisiones educativas.

## 2. Objetivo del proyecto

El objetivo principal de EduGuide es proporcionar un asistente virtual accesible que pueda:

- Ofrecer información precisa sobre procesos de admisión educativa
- Orientar sobre opciones de becas y financiamiento académico
- Proporcionar guía en la elección de carreras profesionales
- Recomendar técnicas y estrategias de estudio efectivas
- Crear una experiencia conversacional natural y atractiva
- Responder de manera contextual y personalizada a las consultas de los usuarios

El asistente busca democratizar el acceso a la orientación educativa, ofreciendo respuestas inmediatas a preguntas comunes y reduciendo las barreras de información que muchos estudiantes enfrentan.

## 3. Tecnologías usadas

EduGuide está construido utilizando las siguientes tecnologías:

### Frontend:
- **HTML5**: Para la estructura base de la aplicación
- **CSS3**: Para los estilos y diseño responsivo
- **JavaScript (ES6+)**: Para la lógica de la interfaz y funcionalidades interactivas

### Integración de IA:
- **API de OpenAI**: Para generar respuestas inteligentes y contextuales

### Librerías:
- **Font Awesome (6.4.0)**: Para los iconos de la interfaz
- **No se requieren frameworks adicionales**: El proyecto está desarrollado con JavaScript vanilla para máxima eficiencia

### Características técnicas implementadas:
- Diseño responsivo para adaptarse a diferentes dispositivos
- Modo claro/oscuro para mejorar la experiencia de usuario
- Animaciones suaves para una experiencia más natural
- Sistema de botones de respuesta rápida
- Manejo de historial de chat
- Efectos de "typing" para simular la escritura en tiempo real

## 4. Cómo funciona el agente (flujo de datos)

EduGuide funciona siguiendo un flujo de datos bien definido:

1. **Inicialización**:
   - El usuario carga la página web
   - Se inicializan los componentes de la interfaz (contenedor de mensajes, entrada de texto, botones)
   - Se configuran los manejadores de eventos

2. **Interacción del usuario**:
   - El usuario puede iniciar la conversación de dos maneras:
     - Escribiendo un mensaje en el campo de texto
     - Seleccionando una categoría predefinida (Admisiones, Becas, Carreras, Técnicas de Estudio)

3. **Procesamiento de la entrada**:
   - El mensaje del usuario se captura y se muestra en la interfaz
   - Se activa una animación de "typing" para simular que el asistente está escribiendo

4. **Generación de respuesta**:
   - **Modo con OpenAI**: 
     - Se construye un prompt contextualizado con el historial de la conversación
     - Se envía una solicitud a la API de OpenAI (modelo gpt-3.5-turbo)
     - Se recibe y procesa la respuesta de la API
   - **Modo local (fallback)**:
     - Se utiliza una base de conocimiento interna con respuestas predefinidas
     - Se selecciona una respuesta apropiada según el contexto y categoría

5. **Presentación de la respuesta**:
   - Se muestra la respuesta del asistente en la interfaz
   - Se generan y muestran botones de respuesta rápida relevantes al contexto
   - Se actualiza el historial de la conversación

6. **Ciclo de conversación**:
   - El usuario puede continuar la conversación escribiendo más mensajes o seleccionando botones de respuesta rápida
   - El proceso se repite desde el paso 3

### Diagrama de flujo de datos:

```
Usuario → Entrada de texto/selección → Procesamiento → 
          API OpenAI/Base de conocimiento local → 
          Generación de respuesta → Interfaz de usuario → Usuario
```

## 5. Conexión con la API de OpenAI

EduGuide se conecta con la API de OpenAI mediante solicitudes HTTP estándar. El proceso es el siguiente:

1. **Configuración inicial**:
   - Se almacena la clave de API de OpenAI en una variable (por seguridad, en una implementación real debería manejarse en el backend)
   - Se define un prompt de sistema que establece el comportamiento del asistente

2. **Preparación de la solicitud**:
   - Se construye un objeto de solicitud con:
     - El mensaje del usuario
     - El contexto de la conversación (categoría educativa)
     - Parámetros de generación (temperatura, tokens máximos)

3. **Envío de la solicitud**:
   ```javascript
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
   ```

4. **Procesamiento de la respuesta**:
   - Se parsea la respuesta JSON recibida
   - Se extrae el texto generado por la IA
   - Se maneja cualquier error que pueda ocurrir durante el proceso

5. **Sistema de fallback**:
   - Si la API no está disponible o devuelve un error, el sistema recurre automáticamente a sus respuestas predefinidas
   - Esto garantiza que el asistente siempre pueda responder, incluso sin conectividad

## 6. Instalación y configuración

### Requisitos previos:
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet (solo para la versión con IA de OpenAI)
- Servidor web básico o entorno de desarrollo local

### Pasos de instalación:

1. **Clonar o descargar los archivos del proyecto**:
   - index.html
   - styles.css
   - script.js

2. **Configuración para uso local (sin OpenAI)**:
   - No se requiere configuración adicional, el sistema utilizará sus respuestas predefinidas

3. **Configuración para uso con OpenAI**:
   - Crea una cuenta en OpenAI (https://platform.openai.com)
   - Genera una clave de API en la sección de configuración
   - En el archivo script.js, reemplaza el valor de la variable `OPENAI_API_KEY` con tu clave personal:
   ```javascript
   const OPENAI_API_KEY = "tu-clave-api-aquí";
   ```

4. **Prueba local**:
   - Abre el archivo index.html en tu navegador, o
   - Utiliza un servidor web local (como Live Server en VS Code)

5. **Despliegue en producción** (opcional):
   - Sube los archivos a un servidor web
   - Por seguridad, considera implementar un backend para manejar las llamadas a la API y no exponer tu clave de API directamente en el frontend

## 7. Cómo usar EduGuide

### Interfaz principal:

La interfaz de EduGuide consta de varios componentes clave:
- **Panel lateral izquierdo**: Historial de chats y categorías temáticas
- **Área principal de chat**: Donde se desarrolla la conversación
- **Campo de entrada**: Para escribir mensajes
- **Botón de tema**: Para alternar entre modo claro y oscuro

### Pasos para usar la aplicación:

1. **Iniciar una conversación**:
   - Escribe una pregunta directamente en el campo de texto, o
   - Selecciona una de las categorías predefinidas en el panel lateral (Admisiones, Becas, Carreras, Técnicas de Estudio)

2. **Respuestas y seguimiento**:
   - EduGuide responderá a tu consulta y mostrará botones de respuesta rápida
   - Puedes hacer clic en estos botones para hacer preguntas de seguimiento rápidas
   - También puedes escribir libremente tu siguiente pregunta

3. **Cambiar de tema**:
   - Utiliza el botón de tema en la esquina superior derecha para alternar entre modo claro y oscuro

4. **Historial de conversaciones**:
   - Selecciona conversaciones anteriores desde el panel izquierdo para revisar discusiones previas

### Ejemplos de uso:

1. **Consultar sobre becas**:
   - Usuario: "¿Qué tipos de becas están disponibles para estudiantes internacionales?"
   - EduGuide: [Proporciona información detallada sobre tipos de becas y muestra botones para explorar opciones específicas]

2. **Orientación vocacional**:
   - Usuario: "No estoy seguro de qué carrera elegir"
   - EduGuide: [Ofrece consejos para la elección de carrera y sugiere herramientas o métodos para ayudar en la decisión]

## 8. Conclusión final

EduGuide representa una solución innovadora para la orientación educativa, combinando una interfaz de usuario intuitiva con capacidades de inteligencia artificial para proporcionar asistencia personalizada a estudiantes. Sus principales fortalezas incluyen:

- **Accesibilidad**: Disponible 24/7 para resolver dudas educativas
- **Versatilidad**: Cubre múltiples aspectos del ámbito académico
- **Adaptabilidad**: Funciona tanto con IA avanzada como con un sistema de respuestas local
- **Experiencia de usuario**: Interfaz amigable e interactiva que simula una conversación natural

El proyecto demuestra cómo las tecnologías web modernas pueden combinarse con soluciones de IA para crear herramientas educativas valiosas. La arquitectura flexible permite que EduGuide pueda evolucionar y mejorar con el tiempo, incorporando nuevas características o ampliando su base de conocimiento.

Para desarrollos futuros, se podría considerar:
- Implementación de un backend para mayor seguridad
- Ampliación de la base de conocimiento con más temas educativos
- Integración con sistemas de gestión de aprendizaje existentes
- Funcionalidades adicionales como recomendaciones de recursos educativos

EduGuide cumple su objetivo de democratizar el acceso a la orientación educativa, ofreciendo un asistente virtual que puede ayudar a los estudiantes a navegar por decisiones educativas importantes de manera informada y personalizada.
