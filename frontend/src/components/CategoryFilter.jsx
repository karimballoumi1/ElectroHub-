export default function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 py-4">
      <button
        className={`px-6 py-2 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md ${
          selected === null
            ? 'bg-slate-800 text-white'
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
        }`}
        onClick={() => onSelect(null)}
      >
        All Products
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          className={`px-6 py-2 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md ${
            selected === category.id
              ? 'bg-slate-800 text-white scale-105'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
          onClick={() => onSelect(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
