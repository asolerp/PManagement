# Configuración de OpenAI para generación de plantillas

La función `generateEmailToOwnerTemplate` usa la API de OpenAI para generar asunto, cuerpo y plantilla HTML del email a propietarios. La API key **no** se pone en el código: se configura como secreto en Firebase (Google Secret Manager).

## 1. Crear una API key en OpenAI

1. Entra en [OpenAI API Keys](https://platform.openai.com/api-keys).
2. Crea un nuevo token (Create new secret key).
3. Copia el valor (empieza por `sk-...`). No se vuelve a mostrar; guárdalo en un gestor de contraseñas si lo necesitas de nuevo.

## 2. Configurar el secreto en Firebase

Desde la raíz del proyecto (donde está `firebase.json`):

```bash
firebase functions:secrets:set OPENAI_API_KEY
```

Cuando lo pida, pega la API key de OpenAI. El valor se guarda en Secret Manager y estará disponible para las Cloud Functions que declaren este secreto.

## 3. Desplegar las funciones

Tras configurar el secreto, despliega (o vuelve a desplegar) las functions para que usen el nuevo valor:

```bash
cd functions
npm run deploy
# o: firebase deploy --only functions
```

## 4. Comprobar que funciona

En el dashboard de administración, ve a **Configuración → Email a propietarios** y pulsa **"Generar plantilla con IA"**. Si el secreto está bien configurado, se rellenarán asunto, cuerpo y plantilla HTML; puedes editarlos y guardar.

Si aparece un error del tipo "OPENAI_API_KEY no configurado", revisa que hayas ejecutado `firebase functions:secrets:set OPENAI_API_KEY` y vuelto a desplegar.

## Coste

La función usa el modelo `gpt-4o-mini`, que es económico. El coste depende del uso en tu cuenta de OpenAI; revisa [OpenAI Pricing](https://openai.com/api/pricing/).
