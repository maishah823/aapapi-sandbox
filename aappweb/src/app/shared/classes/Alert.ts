export enum AlertTypes {
    ERROR ='error',
    INFO ='info',
    WARNING ='warning',
    SUCCESS ='success'
};


export class Alert {
    index?: string;
    type: AlertTypes;
    title: string;
    message: string;
}