export type PageHeaderInfo = {
    pageName: string;
}

const PageHeader = ({ pageName }: PageHeaderInfo) => {

    return (
        <>
            <div className="mt-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        {pageName}
                    </h2>
                </div>
            </div>
        </>
    )
}

export default PageHeader