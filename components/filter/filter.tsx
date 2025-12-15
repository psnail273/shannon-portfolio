type Props = {
  selectedFilter: string;
  handleFilterClick: (filter: string) => void | Promise<void>;
  filters: string[];
};

export default function Filter({ selectedFilter, handleFilterClick, filters }: Props) {
  return (
    <div>
      <div className="xs:hidden">
        <label className="sr-only" htmlFor="filter-select">Filter</label>
        <select
          id="filter-select"
          className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b997ce]"
          value={ selectedFilter }
          onChange={ (e) => { void handleFilterClick(e.target.value); } }
        >
          { filters.map((filter) => (
            <option key={ filter } value={ filter }>
              { filter }
            </option>
          )) }
        </select>
      </div>

      <div className="hidden flex-row items-center gap-4 overflow-x-auto text-nowrap xs:flex">
        { filters.map((filter) => (
          <div
            className="relative px-2 text-[#8d8d8d] transition-colors duration-400 ease-in-out hover:text-black active:text-black focus-visible:text-black"
            key={ filter }
            onClick={ () => { void handleFilterClick(filter); } }
          >
            <hr className={ `absolute left-0 ${selectedFilter === filter ? 'w-full' : 'w-0'} top-2.75 h-[2px] bg-[#b997ce]` } />
            <span className="cursor-pointer">{ filter }</span>
          </div>
        )) }
      </div>
    </div>
  );
}