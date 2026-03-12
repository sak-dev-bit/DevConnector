const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        // Apply transformed values back to req (e.g., skills string → array)
        if (parsed.body !== undefined) req.body = parsed.body;
        if (parsed.query !== undefined) req.query = parsed.query;
        if (parsed.params !== undefined) req.params = parsed.params;
        next();
    } catch (error) {
        // Catch Zod validation errors (ZodError instanceof check is most reliable)
        if (error instanceof ZodError || error.name === 'ZodError' || Array.isArray(error.errors)) {
            const issues = error.errors || error.issues || [];
            const formattedErrors = issues.map((err) => ({
                path: Array.isArray(err.path) ? err.path.join('.').replace(/^body\./, '') : String(err.path),
                msg: err.message,
            }));

            return res.status(400).json({
                success: false,
                errors: formattedErrors,
                msg: formattedErrors.length > 0 ? formattedErrors[0].msg : 'Validation error',
            });
        }
        next(error);
    }
};

module.exports = validate;

