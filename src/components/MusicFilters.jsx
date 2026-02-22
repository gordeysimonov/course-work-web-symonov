import React from 'react';

const MusicFilters = ({
                          searchQuery,
                          handleSearchChange,
                          sortOption,
                          handleSortChange,
                          yearRange,
                          handleYearRangeChange,
                          selectedGenres,
                          handleGenreChange,
                          genres
                      }) => {
    return (
        <div className="filters">
            <div className="filter-group">
                <input
                    type="text"
                    placeholder="Пошук..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="filter-group">
                <label>Фільтрувати за роком:</label>
                <input
                    type="text"
                    placeholder="1900-2024"
                    value={`${yearRange[0]}-${yearRange[1]}`}
                    onChange={handleYearRangeChange}
                />
            </div>

            <div className="filter-group">
                <label>Фільтрувати за жанром:</label>
                <select multiple value={selectedGenres} onChange={handleGenreChange}>
                    {genres.map((genre) => (
                        <option key={genre.id} value={genre.genre}>
                            {genre.genre}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label>Сортувати за:</label>
                <select value={sortOption} onChange={handleSortChange}>
                    <option value="year">Рік (від найновішого до найстарішого)</option>
                    <option value="date">Дата завантаження (від новішого до старішого)</option>
                    <option value="rating">Оцінка (від найвищої до найнижчої)</option>
                </select>
            </div>
        </div>
    );
};

export default MusicFilters;
