const Hapi = require('@hapi/hapi');
const { nanoid } = require('nanoid');

let books = []; 


const init = async () => {
    const server = Hapi.server({
        port: 9000,
        host: 'localhost',
        routes: {
            cors: {
                origin: ['*'], 
            },
        },
    });


    server.route({
        method: 'POST',
        path: '/books',
        handler: async (request, h) => {
            const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

            if (!name) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal menambahkan buku. Mohon isi nama buku',
                }).code(400);
            }

            if (readPage > pageCount) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
                }).code(400);
            }

            const id = nanoid(16);
            const insertedAt = new Date().toISOString();
            const updatedAt = insertedAt;
            const finished = pageCount === readPage;

            const newBook = {
                id, name, year, author, summary, publisher, pageCount, readPage,
                finished, reading, insertedAt, updatedAt,
            };

            books.push(newBook);

            return h.response({
                status: 'success',
                message: 'Buku berhasil ditambahkan',
                data: {
                    bookId: id,
                },
            }).code(201);
        },
    });


    server.route({
        method: 'GET',
        path: '/books',
        handler: (request, h) => {
            const { name, reading, finished } = request.query;

            let filteredBooks = books;

            if (name) {
                filteredBooks = filteredBooks.filter(book => book.name.toLowerCase().includes(name.toLowerCase()));
            }

            if (reading !== undefined) {
                filteredBooks = filteredBooks.filter(book => book.reading === (reading === '1'));
            }

            if (finished !== undefined) {
                filteredBooks = filteredBooks.filter(book => book.finished === (finished === '1'));
            }

            const bookList = filteredBooks.map(book => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher,
            }));

            return h.response({
                status: 'success',
                data: {
                    books: bookList,
                },
            }).code(200);
        },
    });


    server.route({
        method: 'GET',
        path: '/books/{id}',
        handler: (request, h) => {
            const { id } = request.params;
            const book = books.find(b => b.id === id);

            if (!book) {
                return h.response({
                    status: 'fail',
                    message: 'Buku tidak ditemukan',
                }).code(404);
            }

            return h.response({
                status: 'success',
                data: {
                    book,
                },
            }).code(200);
        },
    });


    server.route({
        method: 'PUT',
        path: '/books/{id}',
        handler: (request, h) => {
            const { id } = request.params;
            const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
            const updatedAt = new Date().toISOString();

            const book = books.find(b => b.id === id);

            if (!book) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal memperbarui buku. Id tidak ditemukan',
                }).code(404);
            }

            if (!name) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal memperbarui buku. Mohon isi nama buku',
                }).code(400);
            }

            if (readPage > pageCount) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
                }).code(400);
            }


            book.name = name;
            book.year = year;
            book.author = author;
            book.summary = summary;
            book.publisher = publisher;
            book.pageCount = pageCount;
            book.readPage = readPage;
            book.reading = reading;
            book.updatedAt = updatedAt;
            book.finished = pageCount === readPage;

            return h.response({
                status: 'success',
                message: 'Buku berhasil diperbarui',
            }).code(200);
        },
    });


    server.route({
        method: 'DELETE',
        path: '/books/{id}',
        handler: (request, h) => {
            const { id } = request.params;
            const bookIndex = books.findIndex(b => b.id === id);

            if (bookIndex === -1) {
                return h.response({
                    status: 'fail',
                    message: 'Buku gagal dihapus. Id tidak ditemukan',
                }).code(404);
            }

            books.splice(bookIndex, 1);

            return h.response({
                status: 'success',
                message: 'Buku berhasil dihapus',
            }).code(200);
        },
    });

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
