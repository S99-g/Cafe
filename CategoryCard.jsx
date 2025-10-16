function CategoryCard({ image, title, desc, to }) {
  return (
    <Link
      to={to}
      className="group block no-underline text-inherit bg-[#fff7ee] rounded-2xl overflow-hidden
                 shadow-sm ring-1 ring-[#e7d7c7] hover:shadow-md hover:-translate-y-0.5 transition"
    >
      {/* top image */}
      <div className="h-44">
        <img src={image} alt={title} className="h-full w-full object-cover" />
      </div>

      {/* body */}
      <div className="p-5">
        <h3 className="text-xl font-semibold text-[#3c2916]">{title}</h3>
        <p className="mt-1 text-sm text-[#6b5c51]">{desc}</p>
        <span className="mt-4 inline-block px-4 py-2 rounded-full bg-amber-500 text-[#2b2b2b] font-medium group-hover:bg-amber-400">
          View Items
        </span>
      </div>
    </Link>
  );
}
