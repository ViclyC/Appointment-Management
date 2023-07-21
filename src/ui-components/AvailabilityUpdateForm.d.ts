/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
import { Availability } from "../models";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type AvailabilityUpdateFormInputValues = {
    time?: number;
};
export declare type AvailabilityUpdateFormValidationValues = {
    time?: ValidationFunction<number>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type AvailabilityUpdateFormOverridesProps = {
    AvailabilityUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    time?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type AvailabilityUpdateFormProps = React.PropsWithChildren<{
    overrides?: AvailabilityUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    availability?: Availability;
    onSubmit?: (fields: AvailabilityUpdateFormInputValues) => AvailabilityUpdateFormInputValues;
    onSuccess?: (fields: AvailabilityUpdateFormInputValues) => void;
    onError?: (fields: AvailabilityUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: AvailabilityUpdateFormInputValues) => AvailabilityUpdateFormInputValues;
    onValidate?: AvailabilityUpdateFormValidationValues;
} & React.CSSProperties>;
export default function AvailabilityUpdateForm(props: AvailabilityUpdateFormProps): React.ReactElement;
