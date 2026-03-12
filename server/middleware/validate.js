const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        if (error.errors) {
            const formattedErrors = error.errors.map((err) => ({
                path: err.path.join('.').replace('body.', ''),
                msg: err.message,
            }));

            return res.status(400).json({
                success: false,
                errors: formattedErrors,
            });
        }
        next(error);
    }
};

module.exports = validate;
