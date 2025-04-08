import express from "express";
import cors from "cors";
import config from "../config.json";
import bodyParser from "body-parser";
import MailController from "./controllers/mailController";
import AuthController from "./controllers/authController";
import EmailController from "./controllers/emailController";
import CategoryController from "./controllers/categoryController";
import logger from "./logger";

const app = express();
const port = config.general.port;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

const mailController = new MailController();
const authController = new AuthController();
const emailController = new EmailController();
const categoryController = new CategoryController();

app.post('/api/auth/login', (req, res) => {
  authController.login(req, res);
});

app.get('/api/auth/verify', (req, res) => {
  authController.verifyAuth(req, res);
});

// Mail Endpoints
app.get('/api/mails', (req, res) => {
  mailController.getMails(req, res);
});

app.get('/api/mails/:id', (req, res) => {
  mailController.getMailById(req, res);
});

app.get('/api/mails/:id/attachments/:attachmentId', (req, res) => {
  mailController.downloadAttachment(req, res);
});

// Lesestatus-Management Endpoints
app.put('/api/mails/:id/readstatus', (req, res) => {
  mailController.updateReadStatus(req, res);
});

app.put('/api/mails/markallunread', (req, res) => {
  mailController.markAllAsUnread(req, res);
});

// E-Mail-Adressen Endpoints
app.get('/api/emails', (req, res) => {
  emailController.getEmails(req, res);
});

// E-Mail-Adressen für Antwort/Weiterleiten in der Frontend-Anwendung
// Diese Zeile wird explizit neu definiert, um sicherzustellen, dass sie richtig registriert ist
app.get('/api/mails/email-addresses', (req, res) => {
  logger.info('Route /api/mails/email-addresses wurde aufgerufen');
  emailController.getEmailAddresses(req, res);
});

// Alternative Route, falls die ursprüngliche nicht funktioniert
app.get('/api/emails/addresses', (req, res) => {
  logger.info('Alternative Route /api/emails/addresses wurde aufgerufen');
  emailController.getEmailAddresses(req, res);
});

// Echtzeit-Überprüfung, ob eine E-Mail-Adresse existiert
app.get('/api/emails/check', (req, res) => {
  emailController.checkEmailExists(req, res);
});

app.post('/api/emails', (req, res) => {
  emailController.addEmail(req, res);
});

app.delete('/api/emails/:id', (req, res) => {
  emailController.removeEmail(req, res);
});

// Kategorien Endpoints
app.get('/api/categories', (req, res) => {
  categoryController.getCategories(req, res);
});

app.get('/api/categories/:id', (req, res) => {
  categoryController.getCategoryById(req, res);
});

app.post('/api/categories', (req, res) => {
  categoryController.addCategory(req, res);
});

app.put('/api/categories/:id', (req, res) => {
  categoryController.updateCategory(req, res);
});

app.delete('/api/categories/:id', (req, res) => {
  categoryController.deleteCategory(req, res);
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});