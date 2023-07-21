/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type AvailabilityCreateFormInputValues = {
    time?: number;
};
export declare type AvailabilityCreateFormValidationValues = {
    time?: ValidationFunction<number>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type AvailabilityCreateFormOverridesProps = {
    AvailabilityCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    time?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type AvailabilityCreateFormProps = React.PropsWithChildren<{
    overrides?: AvailabilityCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: AvailabilityCreateFormInputValues) => AvailabilityCreateFormInputValues;
    onSuccess?: (fields: AvailabilityCreateFormInputValues) => void;
    onError?: (fields: AvailabilityCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: AvailabilityCreateFormInputValues) => AvailabilityCreateFormInputValues;
    onValidate?: AvailabilityCreateFormValidationValues;
} & React.CSSProperties>;
export default function AvailabilityCreateForm(props: AvailabilityCreateFormProps): React.ReactElement;
