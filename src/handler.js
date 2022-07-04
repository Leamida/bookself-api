const { nanoid } = require('nanoid');
const books = require('./books');

const addNewBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  if (name === undefined) {
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

  if (readPage === pageCount) {
    const newFinishedBook = {
      id,
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished: true,
      reading,
      insertedAt,
      updatedAt,
    };
    books.push(newFinishedBook);
  } else {
    const newBook = {
      id,
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished: false,
      reading,
      insertedAt,
      updatedAt,
    };

    books.push(newBook);
  }

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    return h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    }).code(201);
  }
  return h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  }).code(500);
};

const readingBooks = (reading) => {
  const tempBooks = [];

  if (reading === '1') {
    const filterReadingBooks = books.filter((b) => b.reading === false);
    filterReadingBooks.forEach((book) => {
      tempBooks.push({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      });
    });
  } else if (reading === '0') {
    tempBooks.splice(0, tempBooks.length);
    const filterUnReadingBooks = books.filter((b) => b.reading === true);
    filterUnReadingBooks.forEach((book) => {
      tempBooks.push({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      });
    });
  } else {
    tempBooks.splice(0, tempBooks.length);
    books.forEach((book) => {
      tempBooks.push({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      });
    });
  }
  return tempBooks;
};

const getAllReadingBooks = (request, h) => {
  const { reading } = request.query;

  if (reading === '1') {
    return h.response({
      status: 'success',
      data: {
        books: readingBooks('1'),
      },
    }).code(200);
  }

  if (reading === '0') {
    return h.response({
      status: 'success',
      data: {
        books: readingBooks('0'),
      },
    }).code(200);
  }
  return readingBooks('all');
};

const finishedBooks = (finished) => {
  const tempBooks = [];

  if (finished === '0') {
    const filterUnFinishedBooks = books.filter((b) => b.finished === false);
    filterUnFinishedBooks.forEach((book) => {
      tempBooks.push({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      });
    });
  } else if (finished === '1') {
    tempBooks.splice(0, tempBooks.length);
    const filterFinishedBooks = books.filter((b) => b.finished === true);
    filterFinishedBooks.forEach((book) => {
      tempBooks.push({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      });
    });
  } else {
    tempBooks.splice(0, tempBooks.length);
    const filterBooksContainsFinished = books.filter((b) => b.finished !== undefined);
    filterBooksContainsFinished.forEach((book) => {
      tempBooks.push({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      });
    });
  }
  return tempBooks;
};

const getAllFinishedBooks = (request, h) => {
  const { finished } = request.query;

  if (finished === '0') {
    return h.response({
      status: 'success',
      data: {
        books: finishedBooks('0'),
      },
    }).code(200);
  }
  if (finished === '1') {
    return h.response({
      status: 'success',
      data: {
        books: finishedBooks('1'),
      },
    }).code(200);
  }
  return h.response({
    status: 'success',
    data: {
      books: finishedBooks('all'),
    },
  }).code(200);
};

const getAllBooksContainsName = (request, h) => {
  const { name } = request.query;
  const tempBooks = [];

  books.forEach((book) => {
    if (book.name.toLowerCase().includes(name.toLowerCase())) {
      tempBooks.push({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      });
    }
  });

  return h.response({
    status: 'success',
    data: {
      books: tempBooks,
    },
  }).code(200);
};

const getAllBooksHandler = (request, h) => {
  const { reading, finished, name } = request.query;
  if (reading !== undefined) {
    return getAllReadingBooks(request, h);
  }
  if (finished !== undefined) {
    return getAllFinishedBooks(request, h);
  }
  if (name !== undefined) {
    return getAllBooksContainsName(request, h);
  }

  const tempBooks = [];

  books.forEach((book) => {
    tempBooks.push({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    });
  });

  return h.response({
    status: 'success',
    data: {
      books: tempBooks,
    },
  });
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.filter((b) => b.id === bookId)[0];

  if (book !== undefined) {
    return h.response({
      status: 'success',
      data: {
        book,
      },
    }).code(200);
  }

  return h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  }).code(404);
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const updatedAt = new Date().toISOString();

  if (name === undefined) {
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
  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    return h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    }).code(200);
  }

  return h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  }).code(404);
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);
    return h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
  }

  return h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  }).code(404);
};

module.exports = {
  addNewBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
