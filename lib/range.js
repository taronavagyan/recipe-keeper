const range = (max) => {
  let pages = [];
  for (let start = 1; start <= max; start += 1) {
    pages.push(start);
  }

  return pages;
};

module.exports = range;
