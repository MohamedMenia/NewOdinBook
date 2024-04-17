import { cleanEnv } from "envalid";
import { port, str } from "envalid/dist/validators";

export default cleanEnv(process.env, {
  MONGO_CONN: str(),
  PORT: port(),
  JWT_KEY:str(),
  NODE_ENV:str()
});
