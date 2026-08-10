function BreadcrumbBar() {
  return (
    <div className="w-full bg-breadcrumb-background px-8 py-2.5">
      <p className="text-xs font-medium text-primary">
        Home <span className="mx-1.5 text-primary/60">›</span> User Dashboard{' '}
        <span className="mx-1.5 text-primary/60">›</span> My Dashboard
      </p>
    </div>
  )
}

export { BreadcrumbBar }
