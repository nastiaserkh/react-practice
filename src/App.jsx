/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';

import classNames from 'classnames';
import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const SORT_BY_ID = 'id';
const SORT_BY_PRODUCT = 'product';
const SORT_BY_CATEGORY = 'category';
const SORT_BY_USER = 'user';

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(
    cat => cat.id === product.categoryId,
  );
  const user = usersFromServer.find(u => u.id === category.ownerId);

  return { ...product, category, user };
});

function filterTable(
  productsToFilter,
  selectedUser,
  sortingColumn,
  sortingOrder,
  query,
  categories,
) {
  let visibleProducts = [...productsToFilter];
  const normalized = query.trim().toLowerCase();

  if (selectedUser) {
    visibleProducts = visibleProducts.filter(
      product => product.user.name === selectedUser,
    );
  }

  if (sortingColumn) {
    visibleProducts.sort((p1, p2) => {
      switch (sortingColumn) {
        case SORT_BY_USER:
          return p1.user.name.localeCompare(p2.user.name);
        case SORT_BY_CATEGORY:
          return p1.category.title.localeCompare(p2.category.title);
        case SORT_BY_PRODUCT:
          return p1.name.localeCompare(p2.name);
        case SORT_BY_ID:
          return p1.id - p2.id;
        default:
          return 0;
      }
    });
  }

  if (sortingOrder === 'desc') {
    visibleProducts.reverse();
  }

  if (categories.length > 0) {
    visibleProducts = visibleProducts.filter(p =>
      // eslint-disable-next-line prettier/prettier
      categories.includes(p.category.id));
  }

  if (normalized) {
    visibleProducts = visibleProducts.filter(person =>
      person.name.toLowerCase().includes(normalized));
  }

  return visibleProducts;
}

export const App = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortingColumn, setSortingColumn] = useState('');
  const [sortingOrder, setSortingOrder] = useState('');
  const [query, setQuery] = useState('');

  const handleSorting = newColumn => {
    if (sortingColumn !== newColumn) {
      setSortingColumn(newColumn);
      setSortingOrder('asc');
    } else if (sortingOrder === 'asc') {
      setSortingOrder('desc');
    } else if (sortingOrder === 'desc') {
      setSortingColumn(null);
      setSortingOrder('');
    }
  };

  const handleCategoriesFilter = category => {
    let categories = [...selectedCategories];

    if (categories.includes(category)) {
      categories = categories.filter(s => s !== category);
    } else {
      categories.push(category);
    }

    setSelectedCategories(categories);
  };

  const visibleProducts = filterTable(
    products,
    selectedUser,
    sortingColumn,
    sortingOrder,
    query,
    selectedCategories,
  );

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                onClick={() => setSelectedUser(null)}
                className={classNames({
                  'is-active': selectedUser === null,
                })}
              >
                All
              </a>
              {usersFromServer.map(u => (
                <a
                  key={u.id}
                  data-cy="FilterUser"
                  href="#/"
                  onClick={() => setSelectedUser(u.name)}
                  className={classNames({
                    'is-active': selectedUser === u.name,
                  })}
                >
                  {u.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {query.length > 0 && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={classNames('button mr-6 is-success', {
                  'is-outlined': selectedCategories.length !== 0,
                })}
              >
                All
              </a>

              {categoriesFromServer.map(cat => (
                <a
                  key={cat.id}
                  data-cy="Category"
                  className={classNames('button mr-2 my-1', {
                    'is-info': selectedCategories.includes(cat.id),
                  })}
                  href="#/"
                  onClick={() => handleCategoriesFilter(cat.id)}
                >
                  {cat.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedUser(null);
                  setQuery('');
                }}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {visibleProducts.length === 0 && (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          )}

          {visibleProducts.length > 0 && (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  <th onClick={() => handleSorting(SORT_BY_ID)}>
                    <span className="is-flex is-flex-wrap-nowrap">
                      ID
                      <a href="#/">
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={classNames({
                              'fas fa-sort-down':
                                sortingOrder === 'desc' &&
                                sortingColumn === SORT_BY_ID,
                              'fas fa-sort-up':
                                sortingOrder === 'asc' &&
                                sortingColumn === SORT_BY_ID,
                              'fas fa-sort':
                                sortingOrder === '' ||
                                sortingColumn !== SORT_BY_ID,
                            })}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th onClick={() => handleSorting(SORT_BY_PRODUCT)}>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Product
                      <a href="#/">
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={classNames({
                              'fas fa-sort-down':
                                sortingOrder === 'desc' &&
                                sortingColumn === SORT_BY_PRODUCT,
                              'fas fa-sort-up':
                                sortingOrder === 'asc' &&
                                sortingColumn === SORT_BY_PRODUCT,
                              'fas fa-sort':
                                sortingOrder === '' ||
                                sortingColumn !== SORT_BY_PRODUCT,
                            })}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th onClick={() => handleSorting(SORT_BY_CATEGORY)}>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Category
                      <a href="#/">
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={classNames({
                              'fas fa-sort-down':
                                sortingOrder === 'desc' &&
                                sortingColumn === SORT_BY_CATEGORY,
                              'fas fa-sort-up':
                                sortingOrder === 'asc' &&
                                sortingColumn === SORT_BY_CATEGORY,
                              'fas fa-sort':
                                sortingOrder === '' ||
                                sortingColumn !== SORT_BY_CATEGORY,
                            })}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th onClick={() => handleSorting(SORT_BY_USER)}>
                    <span className="is-flex is-flex-wrap-nowrap">
                      User
                      <a href="#/">
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={classNames({
                              'fas fa-sort-down':
                                sortingOrder === 'desc' &&
                                sortingColumn === SORT_BY_USER,
                              'fas fa-sort-up':
                                sortingOrder === 'asc' &&
                                sortingColumn === SORT_BY_USER,
                              'fas fa-sort':
                                sortingOrder === '' ||
                                sortingColumn !== SORT_BY_USER,
                            })}
                          />
                        </span>
                      </a>
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleProducts.map(product => (
                  <tr data-cy="Product" key={product.id}>
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">
                      {product.category &&
                        `${product.category.icon} - ${product.category.title}`}
                    </td>

                    <td
                      data-cy="ProductUser"
                      className={classNames({
                        'has-text-link': product.user?.sex === 'm',
                        'has-text-danger': product.user?.sex === 'f',
                      })}
                    >
                      {product.user?.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
