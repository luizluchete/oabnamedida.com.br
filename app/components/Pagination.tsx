/* This example requires Tailwind CSS v2.0+ */
import { Link, useSearchParams } from "@remix-run/react";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
type PaginationProps = {
  totalRegisters: number;
  registerPerPage: number;
  currentPage: number;
};

const siblingsCunt = 5;

function generatePagesArray(from: number, to: number) {
  return [...new Array(to - from)]
    .map((_, index) => {
      return from + index + 1;
    })
    .filter((page) => page > 0);
}
export function Pagination({
  totalRegisters,
  registerPerPage,
  currentPage,
}: PaginationProps) {
  const [queryParams] = useSearchParams();
  const lastPage = Math.ceil(totalRegisters / registerPerPage);
  const previousPages =
    currentPage > 1
      ? generatePagesArray(currentPage - 1 - siblingsCunt, currentPage - 1)
      : [];

  const nextPages =
    currentPage < lastPage
      ? generatePagesArray(
          currentPage,
          Math.min(currentPage + siblingsCunt, lastPage)
        )
      : [];

  function getParams(page: number): string {
    const params = new URLSearchParams(queryParams);
    params.set("page", page.toString());
    return "?" + params.toString();
  }

  return (
    <div className="flex w-full items-center justify-center border-t border-gray-200 px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <Link
          to={getParams(currentPage - 1)}
          className={`${
            currentPage <= 1 ? "pointer-events-none" : ""
          } relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50`}
        >
          Anterior
        </Link>
        <Link
          to={getParams(currentPage + 1)}
          className={`${
            currentPage >= lastPage ? "pointer-events-none" : ""
          } relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50`}
        >
          Próximo
        </Link>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center">
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <Link
              to={getParams(currentPage - 1)}
              className={`${
                currentPage <= 1 ? "pointer-events-none" : ""
              } relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20`}
            >
              <span className="sr-only">Anterior</span>
              <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
            </Link>
            {/* Current: "z-10 bg-indigo-50 border-indigo-500 text-indigo-600", Default: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50" */}

            {currentPage > 1 + siblingsCunt && (
              <>
                <PaginationItem
                  searchParams={getParams(1)}
                  page={1}
                  isCurrent={currentPage === 1}
                />
                {currentPage > 2 + siblingsCunt && (
                  <span className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                    ...
                  </span>
                )}
              </>
            )}

            {previousPages.length > 0 &&
              previousPages.map((page) => {
                return (
                  <PaginationItem
                    searchParams={getParams(page)}
                    key={page}
                    page={page}
                    isCurrent={currentPage === page}
                  />
                );
              })}

            <PaginationItem
              searchParams={getParams(currentPage)}
              page={currentPage}
              isCurrent
            ></PaginationItem>

            {nextPages.length > 0 &&
              nextPages.map((page) => {
                return (
                  <PaginationItem
                    searchParams={getParams(page)}
                    key={page}
                    page={page}
                  ></PaginationItem>
                );
              })}

            {currentPage + siblingsCunt < lastPage && (
              <>
                {currentPage + 1 + siblingsCunt < lastPage && (
                  <span className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                    ...
                  </span>
                )}
                <PaginationItem
                  searchParams={getParams(lastPage)}
                  page={lastPage}
                ></PaginationItem>
              </>
            )}

            <Link
              to={getParams(currentPage + 1)}
              className={`${
                currentPage >= lastPage ? "pointer-events-none" : ""
              } relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20`}
            >
              <span className="sr-only">Próximo</span>
              <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}

type PaginationItemProps = {
  page: number;
  isCurrent?: boolean;
  searchParams: string;
};

function PaginationItem({
  page,
  isCurrent = false,
  searchParams,
}: PaginationItemProps) {
  return (
    <Link
      to={searchParams}
      aria-current="page"
      className={
        isCurrent
          ? "relative z-10 inline-flex items-center border border-indigo-500 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 focus:z-20"
          : "relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
      }
    >
      {page}
    </Link>
  );
}
