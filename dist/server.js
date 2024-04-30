"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
// Importando rotas
const users_1 = __importDefault(require("./routes/users"));
const projects_1 = __importDefault(require("./routes/projects"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const tags_1 = __importDefault(require("./routes/tags"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Rotas
app.use('/users', users_1.default);
app.use('/projects', projects_1.default);
app.use('/tasks', tasks_1.default);
app.use('/tags', tags_1.default);
// Rota principal
app.get('/', (req, res) => {
    res.send('API do Task Manager');
});
// Carregar o arquivo Swagger
const swaggerDocument = yamljs_1.default.load('./swagger.yaml'); // Certifique-se de que o caminho está correto
// Rota para servir a documentação Swagger
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
