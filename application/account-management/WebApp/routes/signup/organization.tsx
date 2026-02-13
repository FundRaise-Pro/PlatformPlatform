import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { loggedInPath } from "@repo/infrastructure/auth/constants";
import { useIsAuthenticated } from "@repo/infrastructure/auth/hooks";
import { Button } from "@repo/ui/components/Button";
import { Field, FieldDescription, FieldLabel } from "@repo/ui/components/Field";
import { Form } from "@repo/ui/components/Form";
import { Link } from "@repo/ui/components/Link";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@repo/ui/components/Select";
import { TextField } from "@repo/ui/components/TextField";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import FederatedErrorPage from "@/federated-modules/errorPages/FederatedErrorPage";
import { NpoTypeItems } from "@/shared/components/NpoTypeItems";
import logoMarkUrl from "@/shared/images/logo-mark.svg";
import logoWrapUrl from "@/shared/images/logo-wrap.svg";
import { HorizontalHeroLayout } from "@/shared/layouts/HorizontalHeroLayout";
import { api, NpoType } from "@/shared/lib/api/client";
import { getSignupState, hasSignupState, setSignupState } from "./-shared/signupState";

export const Route = createFileRoute("/signup/organization")({
  component: function SignupOrganizationRoute() {
    const navigate = useNavigate();
    const isAuthenticated = useIsAuthenticated();

    useEffect(() => {
      if (isAuthenticated) {
        navigate({ to: loggedInPath() });
        return;
      }

      if (!hasSignupState()) {
        navigate({ to: "/signup", replace: true });
      }
    }, [isAuthenticated, navigate]);

    if (isAuthenticated || !hasSignupState()) {
      return null;
    }

    return (
      <HorizontalHeroLayout>
        <OrganizationDetailsForm />
      </HorizontalHeroLayout>
    );
  },
  errorComponent: FederatedErrorPage
});

function useSlugAvailability(slug: string) {
  const query = api.useQuery("get", "/api/account-management/tenants/slug-available", {
    params: { query: { slug } },
    enabled: slug.length >= 3
  });

  if (!slug || slug.length < 3) {
    return { isAvailable: null, canonicalSlug: slug };
  }

  if (query.isLoading) {
    return { isAvailable: null, canonicalSlug: slug };
  }

  return {
    isAvailable: query.data?.available ?? null,
    canonicalSlug: query.data?.canonicalSlug ?? slug,
    reason: query.data?.reason
  };
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

function OrganizationDetailsForm() {
  const state = getSignupState();
  const [organizationName, setOrganizationName] = useState(state.organizationName ?? "");
  const [slug, setSlug] = useState(state.slug ?? "");
  const [orgType, setOrgType] = useState<NpoType>(state.orgType ?? NpoType.Other);
  const [country, setCountry] = useState(state.country ?? "");
  const [registrationNumber, setRegistrationNumber] = useState(state.registrationNumber ?? "");
  const [description, setDescription] = useState(state.description ?? "");
  const [submitted, setSubmitted] = useState(false);

  const debouncedSlug = useDebouncedValue(slug, 400);
  const { isAvailable, canonicalSlug } = useSlugAvailability(debouncedSlug);

  useEffect(() => {
    if (!slug && organizationName) {
      const derived = organizationName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 63);
      setSlug(derived);
    }
  }, [organizationName, slug]);

  if (submitted) {
    return <Navigate to="/signup/verify" />;
  }

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        setSignupState({
          organizationName,
          slug: canonicalSlug || slug,
          orgType,
          country,
          registrationNumber: registrationNumber || undefined,
          description: description || undefined
        });
        setSubmitted(true);
      }}
      validationBehavior="aria"
      className="flex w-full max-w-sm flex-col items-center gap-4 space-y-1 rounded-lg px-6 pt-8 pb-4"
    >
      <Link href="/" className="cursor-pointer">
        <img src={logoMarkUrl} className="h-12 w-12" alt={t`Logo`} />
      </Link>
      <h2>
        <Trans>Tell us about your organization</Trans>
      </h2>
      <div className="text-center text-muted-foreground text-sm">
        <Trans>We&apos;ll use this to set up your workspace.</Trans>
      </div>

      <TextField
        name="organizationName"
        label={t`Organization name`}
        autoFocus={true}
        isRequired={true}
        value={organizationName}
        onChange={setOrganizationName}
        maxLength={200}
        placeholder={t`e.g. Helping Hands Foundation`}
        className="flex w-full flex-col"
      />

      <TextField
        name="slug"
        label={t`Subdomain`}
        isRequired={true}
        value={slug}
        onChange={setSlug}
        maxLength={63}
        placeholder={t`your-organization`}
        errorMessage={isAvailable === false ? t`This subdomain is not available` : undefined}
        description={t`Your workspace URL: ${slug || t`your-organization`}.fundraiseos.com`}
        className="flex w-full flex-col"
      />

      <Field className="flex w-full flex-col">
        <FieldLabel>{t`Organization type`}</FieldLabel>
        <Select
          name="orgType"
          value={orgType}
          onValueChange={(value: string | null) => setOrgType((value ?? NpoType.Other) as NpoType)}
          required={true}
        >
          <SelectTrigger className="w-full" aria-label={t`Organization type`}>
            <SelectValue>{(value: string) => value || t`Select organization type`}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <NpoTypeItems />
          </SelectContent>
        </Select>
        <FieldDescription>{t`Choose the category that best matches your organization`}</FieldDescription>
      </Field>

      <TextField
        name="country"
        label={t`Country code`}
        isRequired={true}
        value={country}
        onChange={setCountry}
        maxLength={3}
        placeholder={t`e.g. ZAF`}
        description={t`ISO 3166-1 alpha-3 country code`}
        className="flex w-full flex-col"
      />

      <TextField
        name="registrationNumber"
        label={t`Registration number`}
        value={registrationNumber}
        onChange={setRegistrationNumber}
        maxLength={50}
        placeholder={t`Optional`}
        className="flex w-full flex-col"
      />

      <TextField
        name="description"
        label={t`Description`}
        value={description}
        onChange={setDescription}
        maxLength={500}
        placeholder={t`Briefly describe your organization`}
        className="flex w-full flex-col"
      />

      <Button
        type="submit"
        className="mt-4 w-full text-center"
        disabled={!organizationName || !slug || slug.length < 3 || !country || isAvailable === false}
      >
        <Trans>Continue</Trans>
      </Button>

      <Link
        href="/signup"
        className="text-muted-foreground text-xs"
        onClick={() => {
          setSignupState({ organizationName: "", slug: "", country: "" });
        }}
      >
        <Trans>Back to signup</Trans>
      </Link>

      <div className="mt-4 flex flex-col items-center gap-1">
        <span className="text-muted-foreground text-xs">
          <Trans>Powered by</Trans>
        </span>
        <Link href="https://github.com/platformplatform/PlatformPlatform" className="cursor-pointer">
          <img src={logoWrapUrl} alt={t`PlatformPlatform`} className="h-6 w-auto" />
        </Link>
      </div>
    </Form>
  );
}
