/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPrice } from "@/customFunctions/formatPrice";
import { cn } from "@/lib/utils";

type Props = {
    data: {
        orderID: string,
        customerNames: string,
        customerLastnames: string,
        customerEmail: string,
        customerGender: string,
        orderDate: string,
        totalAmount: number,
    }[]
}

const RecentSales = ({ data }: Props) => {

    return (
        <div className="space-y-8">
            {data?.map((sale) => (
                <div key={sale?.orderID} className="flex items-center justify-center">

                    <Avatar className='h-10 w-10'>
                        <Avatar>
                            <AvatarImage src={undefined} alt="Foto" />
                            <AvatarFallback className={cn(
                                sale?.customerGender === 'M' ? 'bg-blue-600' : 'bg-pink-600',
                                'text-gray-100 font-bold'
                            )}>
                                <span className='grid grid-cols-1 justify-items-center'>
                                    {/* NAMES  */}
                                    <span className="text-xs">
                                        {sale?.customerNames && sale?.customerNames?.split(" ")?.map((name: string) =>
                                            <span key={name}>{name[0][0]}</span>
                                        )}
                                    </span>

                                    {/* LASTNAMES  */}
                                    <span className="text-xs">
                                        {sale?.customerLastnames && sale?.customerLastnames?.split(" ")?.map((lastname: string) =>
                                            <span key={lastname}>{lastname[0][0]}</span>
                                        )}
                                    </span>
                                </span>
                            </AvatarFallback>
                        </Avatar>
                    </Avatar>

                    <div className="ml-2 space-y-0 flex-1">
                        <p className="text-xs sm:text-sm text-indigo-700 font-bold leading-none">{sale?.customerNames}</p>
                        <p className="text-xs sm:text-sm text-indigo-700 font-bold leading-none">{sale?.customerLastnames}</p>
                        <p className="text-sm text-muted-foreground">
                            {sale?.customerEmail}
                        </p>
                    </div>

                    <div className="ml-auto text-sm sm:text-base text-pink-800 font-bold">RD$ {formatPrice(sale?.totalAmount)}</div>
                </div>
            ))}
        </div>
    )
}

export default RecentSales