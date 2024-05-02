"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
//import YAML from 'yamljs';
// Importando rotas
const users_1 = __importDefault(require("./routes/users"));
const projects_1 = __importDefault(require("./routes/projects"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const tags_1 = __importDefault(require("./routes/tags"));
// Carregar o arquivo Swagger
//const swaggerDocument = YAML.load('./swag/swagger.yaml'); 
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Rotas
app.use('/users', users_1.default);
app.use('/projects', projects_1.default);
app.use('/tasks', tasks_1.default);
app.use('/tags', tags_1.default);
// Rota para servir a documentação Swagger
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Rota principal
app.get('/', (req, res) => {
    res.send('API do Task Manager');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
