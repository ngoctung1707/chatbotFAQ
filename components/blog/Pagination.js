export default function Pagination({
    prev,
    currentPage,
    getPaginationGroup,
    next,
    pages,
    handleActive,
}) {
    return (
        <>
            <div className="pagination-wrap mt-40">
                <nav aria-label="Page navigation example">
                    <ul className="pagination  list-wrap">
                        {getPaginationGroup.length <= 0 ? null : (
                            <li onClick={prev} className="next_link page-item">
                                {currentPage === 1 ? null : (
                                    <a className="page-link">
                                        <i className="fas fa-angle-double-left" />
                                    </a>
                                )}
                            </li>
                        )}

                        {getPaginationGroup.map((item, index) => {
                            return (
                                <li
                                    onClick={() => handleActive(item)}
                                    key={index}
                                    className={
                                        currentPage === item
                                            ? "page-item active"
                                            : "page-item"
                                    }
                                >
                                    <a className="page-link">{item}</a>
                                </li>
                            )
                        })}

                        {getPaginationGroup.length <= 0 ? null : (
                            <li onClick={next} className="next_link page-item">
                                {currentPage >= pages ? null : (
                                    <a className="page-link">
                                        <i className="fas fa-angle-double-right" />
                                    </a>
                                )}
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </>
    )
}